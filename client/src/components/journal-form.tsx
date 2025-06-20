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
import { insertJournalEntrySchema, type InsertJournalEntry, type JournalEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JournalFormProps {
  entry?: JournalEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function JournalForm({ entry, onSuccess, onCancel }: JournalFormProps) {
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertJournalEntry>({
    resolver: zodResolver(insertJournalEntrySchema),
    defaultValues: {
      title: entry?.title || "",
      content: entry?.content || "",
      difficulty: entry?.difficulty || "beginner",
      source: entry?.source || "documentation",
      tags: entry?.tags || [],
      readTime: entry?.readTime || 5,
      isBookmarked: entry?.isBookmarked || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertJournalEntry) => apiRequest("POST", "/api/journal", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Journal entry created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create journal entry", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertJournalEntry) => apiRequest("PUT", `/api/journal/${entry!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Journal entry updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update journal entry", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertJournalEntry) => {
    const formData = { ...data, tags };
    if (entry) {
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
          placeholder="What did you learn today?"
        />
        {form.formState.errors.title && (
          <p className="text-dev-error text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Content</label>
        <Textarea
          {...form.register("content")}
          className="bg-dev-bg border-dev-border min-h-32"
          placeholder="Describe your learning experience, key insights, and takeaways..."
        />
        {form.formState.errors.content && (
          <p className="text-dev-error text-sm mt-1">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Difficulty</label>
          <Select value={form.watch("difficulty")} onValueChange={(value) => form.setValue("difficulty", value as "beginner" | "intermediate" | "advanced")}>
            <SelectTrigger className="bg-dev-bg border-dev-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Source</label>
          <Select value={form.watch("source")} onValueChange={(value) => form.setValue("source", value as "documentation" | "tutorial" | "experimentation" | "team")}>
            <SelectTrigger className="bg-dev-bg border-dev-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
              <SelectItem value="experimentation">Experimentation</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Read Time (minutes)</label>
          <Input
            type="number"
            {...form.register("readTime", { valueAsNumber: true })}
            className="bg-dev-bg border-dev-border"
            min="1"
          />
        </div>
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
        <Button type="submit" disabled={isLoading} className="bg-dev-accent hover:bg-blue-600">
          {isLoading ? "Saving..." : entry ? "Update Entry" : "Create Entry"}
        </Button>
      </div>
    </form>
  );
}
