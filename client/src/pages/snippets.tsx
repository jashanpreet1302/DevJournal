import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, Code, Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";
import SnippetForm from "@/components/snippet-form";
import SyntaxHighlighter from "@/components/syntax-highlighter";
import type { Snippet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Snippets() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: snippets, isLoading } = useQuery<Snippet[]>({
    queryKey: ["/api/snippets", search, language, category],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (language !== "all") params.append("language", language);
      if (category !== "all") params.append("category", category);
      return fetch(`/api/snippets?${params}`).then(res => res.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/snippets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snippets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Snippet deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete snippet", variant: "destructive" });
    },
  });

  const useSnippetMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/snippets/${id}/use`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snippets"] });
      toast({ title: "Snippet usage recorded" });
    },
  });

  const getLanguageColor = (language: string) => {
    switch (language.toLowerCase()) {
      case "javascript": return "bg-yellow-500/20 text-yellow-400";
      case "typescript": return "bg-blue-500/20 text-blue-400";
      case "python": return "bg-green-500/20 text-green-400";
      case "css": return "bg-pink-500/20 text-pink-400";
      case "html": return "bg-orange-500/20 text-orange-400";
      case "sql": return "bg-purple-500/20 text-purple-400";
      case "bash": return "bg-gray-500/20 text-gray-400";
      case "json": return "bg-indigo-500/20 text-indigo-400";
      default: return "bg-dev-text/20 text-dev-text";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "utilities": return "bg-dev-accent/20 text-dev-accent";
      case "components": return "bg-dev-success/20 text-dev-success";
      case "hooks": return "bg-dev-warning/20 text-dev-warning";
      case "api": return "bg-purple-500/20 text-purple-400";
      case "styling": return "bg-pink-500/20 text-pink-400";
      case "configuration": return "bg-gray-500/20 text-gray-400";
      default: return "bg-dev-text/20 text-dev-text";
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this snippet?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard" });
  };

  const handleUseSnippet = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    useSnippetMutation.mutate(id);
    toast({ title: "Snippet copied and usage tracked" });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSnippet(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSnippet(undefined);
  };

  return (
    <div>
      <Header
        onNewEntry={() => setShowForm(true)}
      />

      <div className="p-6">
        {/* Snippet Filters */}
        <div className="bg-dev-surface rounded-xl p-4 border border-dev-border mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-dev-bg border-dev-border w-48">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-dev-bg border-dev-border w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="hooks">Hooks</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="styling">Styling</SelectItem>
                <SelectItem value="configuration">Configuration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Snippets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-dev-surface rounded-xl border border-dev-border animate-pulse">
                <div className="p-4 border-b border-dev-border">
                  <div className="h-6 bg-dev-bg rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-dev-bg rounded w-full"></div>
                </div>
                <div className="p-4">
                  <div className="h-32 bg-dev-bg rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : snippets && snippets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                className="bg-dev-surface rounded-xl border border-dev-border hover:border-dev-success transition-colors animate-slide-up"
              >
                <div className="p-4 border-b border-dev-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-dev-text">{snippet.title}</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUseSnippet(snippet.id, snippet.code)}
                        className="text-dev-text-muted hover:text-dev-success"
                        title="Copy and use snippet"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(snippet.code)}
                        className="text-dev-text-muted hover:text-dev-text"
                        title="Copy code"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(snippet)}
                        className="text-dev-text-muted hover:text-dev-text"
                        title="Edit snippet"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(snippet.id)}
                        className="text-dev-text-muted hover:text-dev-error"
                        title="Delete snippet"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-dev-text-muted text-sm">{snippet.description}</p>
                </div>

                <div className="p-4">
                  <div className="bg-dev-bg rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-dev-border">
                      <div className="flex items-center space-x-2">
                        <Badge className={getLanguageColor(snippet.language)}>
                          {snippet.language}
                        </Badge>
                        <Badge className={getCategoryColor(snippet.category)}>
                          {snippet.category}
                        </Badge>
                      </div>
                      <span className="text-dev-text-muted text-xs">
                        Used {snippet.timesUsed} times
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <SyntaxHighlighter 
                        code={snippet.code} 
                        language={snippet.language}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-2">
                      {snippet.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-dev-bg text-dev-text text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-dev-text-muted text-xs">
                      {format(new Date(snippet.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dev-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="text-dev-success" size={24} />
            </div>
            <h3 className="text-lg font-medium text-dev-text mb-2">No Code Snippets</h3>
            <p className="text-dev-text-muted mb-4">
              Start building your code snippet library by saving reusable code blocks.
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-dev-success hover:bg-green-600">
              <Plus className="mr-2" size={16} />
              Add Snippet
            </Button>
          </div>
        )}

        {/* Snippet Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-dev-surface border-dev-border max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-dev-text">
                {editingSnippet ? "Edit Code Snippet" : "Add New Snippet"}
              </DialogTitle>
            </DialogHeader>
            <SnippetForm
              snippet={editingSnippet}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
