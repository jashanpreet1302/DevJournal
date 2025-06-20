import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Bookmark, Edit, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";
import JournalForm from "@/components/journal-form";
import type { JournalEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Journal() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [source, setSource] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal", search, difficulty, source],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (difficulty !== "all") params.append("difficulty", difficulty);
      if (source !== "all") params.append("source", source);
      return fetch(`/api/journal?${params}`).then(res => res.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/journal/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Journal entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete journal entry", variant: "destructive" });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-dev-success/20 text-dev-success";
      case "intermediate": return "bg-dev-warning/20 text-dev-warning";
      case "advanced": return "bg-dev-error/20 text-dev-error";
      default: return "bg-dev-text/20 text-dev-text";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "documentation": return "bg-dev-accent/20 text-dev-accent";
      case "tutorial": return "bg-dev-success/20 text-dev-success";
      case "experimentation": return "bg-dev-warning/20 text-dev-warning";
      case "team": return "bg-purple-500/20 text-purple-400";
      default: return "bg-dev-text/20 text-dev-text";
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEntry(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(undefined);
  };

  return (
    <div>
      <Header
        onNewEntry={() => setShowForm(true)}
      />

      <div className="p-6">
        {/* Filter/Search Bar */}
        <div className="bg-dev-surface rounded-xl p-4 border border-dev-border mb-6">
          <div className="flex flex-wrap gap-4">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-dev-bg border-dev-border w-48">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="bg-dev-bg border-dev-border w-48">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="experimentation">Experimentation</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Journal Entries */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-dev-surface rounded-xl p-6 border border-dev-border animate-pulse">
                <div className="h-6 bg-dev-bg rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-dev-bg rounded mb-2 w-full"></div>
                <div className="h-4 bg-dev-bg rounded mb-4 w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-dev-bg rounded w-16"></div>
                  <div className="h-6 bg-dev-bg rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-6">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="bg-dev-surface rounded-xl p-6 border border-dev-border hover:border-dev-accent transition-colors animate-slide-up"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dev-text mb-2">{entry.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-dev-text-muted">
                      <span className="flex items-center">
                        <Calendar className="mr-1" size={14} />
                        {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <Badge className={getDifficultyColor(entry.difficulty)}>
                        {entry.difficulty}
                      </Badge>
                      <Badge className={getSourceColor(entry.source)}>
                        {entry.source}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      className="text-dev-text-muted hover:text-dev-text"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-dev-text-muted hover:text-dev-error"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="text-dev-text-muted mb-4">
                  <p>{entry.content}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-dev-bg text-dev-text">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-dev-text-muted">
                    <span className="flex items-center">
                      <Clock className="mr-1" size={14} />
                      {entry.readTime} min read
                    </span>
                    {entry.isBookmarked ? (
                      <span className="flex items-center text-dev-warning">
                        <Bookmark className="mr-1" size={14} />
                        Bookmarked
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dev-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-dev-accent" size={24} />
            </div>
            <h3 className="text-lg font-medium text-dev-text mb-2">No Journal Entries</h3>
            <p className="text-dev-text-muted mb-4">
              Start documenting your learning journey by creating your first journal entry.
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-dev-accent hover:bg-blue-600">
              <Plus className="mr-2" size={16} />
              Create Entry
            </Button>
          </div>
        )}

        {/* Journal Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-dev-surface border-dev-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-dev-text">
                {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
              </DialogTitle>
            </DialogHeader>
            <JournalForm
              entry={editingEntry}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
