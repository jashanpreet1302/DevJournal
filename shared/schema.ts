import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  source: text("source").notNull(), // documentation, tutorial, experimentation, team
  tags: text("tags").array().notNull().default([]),
  readTime: integer("read_time").notNull().default(0),
  isBookmarked: integer("is_bookmarked").notNull().default(0), // 0 or 1 for boolean
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bugs = pgTable("bugs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  solution: text("solution"),
  status: text("status").notNull(), // open, in_progress, resolved
  priority: text("priority").notNull(), // low, medium, high, critical
  problemCode: text("problem_code"),
  solutionCode: text("solution_code"),
  tags: text("tags").array().notNull().default([]),
  resolutionTime: integer("resolution_time"), // in hours
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  category: text("category").notNull(), // utilities, components, hooks, api
  tags: text("tags").array().notNull().default([]),
  timesUsed: integer("times_used").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertBugSchema = createInsertSchema(bugs).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertSnippetSchema = createInsertSchema(snippets).omit({
  id: true,
  createdAt: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertBug = z.infer<typeof insertBugSchema>;
export type Bug = typeof bugs.$inferSelect;

export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;

// Analytics types
export type DashboardStats = {
  totalInsights: number;
  bugsResolved: number;
  snippets: number;
  streak: number;
  weeklyGrowth: {
    insights: number;
    bugs: number;
  };
};

export type ActivityData = {
  date: string;
  journalEntries: number;
  bugsResolved: number;
  snippetsAdded: number;
};

export type TechnologyDistribution = {
  name: string;
  count: number;
  percentage: number;
};
