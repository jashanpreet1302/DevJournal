import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, Trash2, Bug as BugIcon, CheckCircle, Copy } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";
import BugForm from "@/components/bug-form";
import SyntaxHighlighter from "@/components/syntax-highlighter";
import type { Bug } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Bugs() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bugs, isLoading } = useQuery<Bug[]>({
    queryKey: ["/api/bugs", search, status, priority],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (status !== "all") params.append("status", status);
      if (priority !== "all") params.append("priority", priority);
      return fetch(`/api/bugs?${params}`).then(res => res.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/bugs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bugs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Bug deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete bug", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-dev-error/20 text-dev-error";
      case "in_progress": return "bg-dev-warning/20 text-dev-warning";
      case "resolved": return "bg-dev-success/20 text-dev-success";
      default: return "bg-dev-text/20 text-dev-text";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gray-500/20 text-gray-400";
      case "medium": return "bg-dev-warning/20 text-dev-warning";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "critical": return "bg-dev-error/20 text-dev-error";
      default: return "bg-dev-text/20 text-dev-text";
    }
  };

  const handleEdit = (bug: Bug) => {
    setEditingBug(bug);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this bug report?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard" });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBug(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBug(undefined);
  };

  return (
    <div>
      <Header
        onNewEntry={() => setShowForm(true)}
      />

      <div className="p-6">
        {/* Bug Status Filter */}
        <div className="bg-dev-surface rounded-xl p-4 border border-dev-border mb-6">
          <div className="flex flex-wrap gap-4">
            <Button
              variant={status === "all" ? "default" : "outline"}
              onClick={() => setStatus("all")}
              className={status === "all" ? "bg-dev-accent" : ""}
            >
              All Bugs
            </Button>
            <Button
              variant={status === "open" ? "default" : "outline"}
              onClick={() => setStatus("open")}
              className={status === "open" ? "bg-dev-error" : ""}
            >
              Open
            </Button>
            <Button
              variant={status === "in_progress" ? "default" : "outline"}
              onClick={() => setStatus("in_progress")}
              className={status === "in_progress" ? "bg-dev-warning" : ""}
            >
              In Progress
            </Button>
            <Button
              variant={status === "resolved" ? "default" : "outline"}
              onClick={() => setStatus("resolved")}
              className={status === "resolved" ? "bg-dev-success" : ""}
            >
              Resolved
            </Button>

            <div className="flex-1"></div>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="bg-dev-bg border-dev-border w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bug List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-dev-surface rounded-xl p-6 border border-dev-border animate-pulse">
                <div className="h-6 bg-dev-bg rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-dev-bg rounded mb-2 w-full"></div>
                <div className="h-4 bg-dev-bg rounded mb-4 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : bugs && bugs.length > 0 ? (
          <div className="space-y-4">
            {bugs.map((bug) => (
              <div
                key={bug.id}
                className="bg-dev-surface rounded-xl p-6 border border-dev-border hover:border-dev-error transition-colors animate-slide-up"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <Badge className={getStatusColor(bug.status)}>
                        {bug.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={`ml-3 ${getPriorityColor(bug.priority)}`}>
                        {bug.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-dev-text mb-2">{bug.title}</h3>
                    <p className="text-dev-text-muted text-sm mb-4">{bug.description}</p>

                    {/* Problem Code */}
                    {bug.problemCode && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-dev-text-muted text-xs">Problem Code</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(bug.problemCode!)}
                            className="text-dev-text-muted hover:text-dev-text text-xs"
                          >
                            <Copy className="mr-1" size={12} />
                            Copy
                          </Button>
                        </div>
                        <SyntaxHighlighter code={bug.problemCode} language="javascript" />
                      </div>
                    )}

                    {/* Solution */}
                    {bug.solution && (
                      <div className="bg-dev-success/10 border border-dev-success/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="text-dev-success mr-2" size={16} />
                          <span className="text-dev-success font-medium text-sm">Solution</span>
                        </div>
                        <p className="text-dev-text-muted text-sm mb-3">{bug.solution}</p>
                        
                        {bug.solutionCode && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-dev-text-muted text-xs">Solution Code</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyCode(bug.solutionCode!)}
                                className="text-dev-text-muted hover:text-dev-text text-xs"
                              >
                                <Copy className="mr-1" size={12} />
                                Copy
                              </Button>
                            </div>
                            <SyntaxHighlighter code={bug.solutionCode} language="javascript" />
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(bug)}
                      className="text-dev-text-muted hover:text-dev-text"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bug.id)}
                      className="text-dev-text-muted hover:text-dev-error"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dev-border">
                  <div className="flex space-x-4 text-sm text-dev-text-muted">
                    <span className="flex items-center">
                      <Calendar className="mr-1" size={14} />
                      {format(new Date(bug.createdAt), "MMM d, yyyy")}
                    </span>
                    {bug.resolutionTime && (
                      <span className="flex items-center">
                        <Clock className="mr-1" size={14} />
                        Resolved in {bug.resolutionTime}h
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bug.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-dev-bg text-dev-text text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dev-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BugIcon className="text-dev-error" size={24} />
            </div>
            <h3 className="text-lg font-medium text-dev-text mb-2">No Bugs Reported</h3>
            <p className="text-dev-text-muted mb-4">
              Great! No bugs have been reported yet. When you encounter one, document it here for future reference.
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-dev-error hover:bg-red-600">
              <BugIcon className="mr-2" size={16} />
              Report Bug
            </Button>
          </div>
        )}

        {/* Bug Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-dev-surface border-dev-border max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-dev-text">
                {editingBug ? "Edit Bug Report" : "Report New Bug"}
              </DialogTitle>
            </DialogHeader>
            <BugForm
              bug={editingBug}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
