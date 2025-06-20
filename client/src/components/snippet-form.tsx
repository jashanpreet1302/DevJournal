import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { insertSnippetSchema, type InsertSnippet, type Snippet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SnippetFormProps {
  snippet?: Snippet;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SnippetForm({ snippet, onSuccess, onCancel }: SnippetFormProps) {
  const [tags, setTags] = useState<string[]>(snippet?.tags || []);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertSnippet>({
    resolver: zodResolver(insertSnippetSchema),
    defaultValues: {
      title: snippet?.title || "",
      description: snippet?.description || "",
      code: snippet?.code || "",
      language: snippet?.language || "javascript",
      category: snippet?.category || "utilities",
      tags: snippet?.tags || [],
      timesUsed: snippet?.timesUsed || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSnippet) => apiRequest("POST", "/api/snippets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snippets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Snippet saved successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to save snippet", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertSnippet) => apiRequest("PUT", `/api/snippets/${snippet!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snippets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Snippet updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update snippet", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertSnippet) => {
    const formData = { ...data, tags };
    if (snippet) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Title</label>
        <Input
          {...form.register("title")}
          className="bg-dev-bg border-dev-border"
          placeholder="Give your snippet a descriptive name"
        />
        {form.formState.errors.title && (
          <p className="text-dev-error text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Description</label>
        <Textarea
          {...form.register("description")}
          className="bg-dev-bg border-dev-border min-h-24"
          placeholder="What does this snippet do? How is it useful?"
        />
        {form.formState.errors.description && (
          <p className="text-dev-error text-sm mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Language</label>
          <Select value={form.watch("language")} onValueChange={(value) => form.setValue("language", value)}>
            <SelectTrigger className="bg-dev-bg border-dev-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Category</label>
          <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
            <SelectTrigger className="bg-dev-bg border-dev-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Code</label>
        <Textarea
          {...form.register("code")}
          className="bg-dev-bg border-dev-border font-mono text-sm min-h-48"
          placeholder="Paste your code snippet here..."
        />
        {form.formState.errors.code && (
          <p className="text-dev-error text-sm mt-1">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-dev-bg text-dev-text">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-dev-text-muted hover:text-dev-text"
                onClick={() => removeTag(tag)}
              >
                <X size={12} />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className="bg-dev-bg border-dev-border"
            placeholder="Add a tag..."
          />
          <Button type="button" onClick={addTag} variant="outline">
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-dev-success hover:bg-green-600">
          {isLoading ? "Saving..." : snippet ? "Update Snippet" : "Save Snippet"}
        </Button>
      </div>
    </form>
  );
}
