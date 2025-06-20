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
import { insertBugSchema, type InsertBug, type Bug } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BugFormProps {
  bug?: Bug;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BugForm({ bug, onSuccess, onCancel }: BugFormProps) {
  const [tags, setTags] = useState<string[]>(bug?.tags || []);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBug>({
    resolver: zodResolver(insertBugSchema),
    defaultValues: {
      title: bug?.title || "",
      description: bug?.description || "",
      solution: bug?.solution || "",
      status: bug?.status || "open",
      priority: bug?.priority || "medium",
      problemCode: bug?.problemCode || "",
      solutionCode: bug?.solutionCode || "",
      tags: bug?.tags || [],
      resolutionTime: bug?.resolutionTime || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBug) => apiRequest("POST", "/api/bugs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bugs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Bug reported successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to report bug", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertBug) => apiRequest("PUT", `/api/bugs/${bug!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bugs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({ title: "Bug updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update bug", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertBug) => {
    const formData = { ...data, tags };
    if (bug) {
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
          placeholder="Brief description of the bug"
        />
        {form.formState.errors.title && (
          <p className="text-dev-error text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Description</label>
        <Textarea
          {...form.register("description")}
          className="bg-dev-bg border-dev-border min-h-32"
          placeholder="Detailed description of the bug, steps to reproduce, expected vs actual behavior..."
        />
        {form.formState.errors.description && (
          <p className="text-dev-error text-sm mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Status</label>
          <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as "open" | "in_progress" | "resolved")}>
            <SelectTrigger className="bg-dev-bg border-dev-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Priority</label>
          <Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value as "low" | "medium" | "high" | "critical")}>
            <SelectTrigger className="bg-dev-bg border-dev-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dev-text mb-2">Resolution Time (hours)</label>
          <Input
            type="number"
            {...form.register("resolutionTime", { valueAsNumber: true })}
            className="bg-dev-bg border-dev-border"
            min="0"
            step="0.5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Problem Code</label>
        <Textarea
          {...form.register("problemCode")}
          className="bg-dev-bg border-dev-border font-mono text-sm min-h-24"
          placeholder="Code that demonstrates the bug..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Solution</label>
        <Textarea
          {...form.register("solution")}
          className="bg-dev-bg border-dev-border min-h-24"
          placeholder="How was this bug resolved? What was the root cause?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dev-text mb-2">Solution Code</label>
        <Textarea
          {...form.register("solutionCode")}
          className="bg-dev-bg border-dev-border font-mono text-sm min-h-24"
          placeholder="Fixed code or solution implementation..."
        />
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
        <Button type="submit" disabled={isLoading} className="bg-dev-error hover:bg-red-600">
          {isLoading ? "Saving..." : bug ? "Update Bug" : "Report Bug"}
        </Button>
      </div>
    </form>
  );
}
