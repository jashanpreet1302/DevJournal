import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema, insertBugSchema, insertSnippetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Journal routes
  app.get("/api/journal", async (req, res) => {
    try {
      const { search, difficulty, source } = req.query;
      const entries = await storage.getJournalEntries(
        search as string,
        difficulty as string,
        source as string
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertJournalEntrySchema.partial().parse(req.body);
      const entry = await storage.updateJournalEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteJournalEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Bug routes
  app.get("/api/bugs", async (req, res) => {
    try {
      const { search, status, priority } = req.query;
      const bugs = await storage.getBugs(
        search as string,
        status as string,
        priority as string
      );
      res.json(bugs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bugs" });
    }
  });

  app.get("/api/bugs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bug = await storage.getBug(id);
      if (!bug) {
        return res.status(404).json({ message: "Bug not found" });
      }
      res.json(bug);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bug" });
    }
  });

  app.post("/api/bugs", async (req, res) => {
    try {
      const validatedData = insertBugSchema.parse(req.body);
      const bug = await storage.createBug(validatedData);
      res.status(201).json(bug);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bug" });
    }
  });

  app.put("/api/bugs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBugSchema.partial().parse(req.body);
      const bug = await storage.updateBug(id, validatedData);
      if (!bug) {
        return res.status(404).json({ message: "Bug not found" });
      }
      res.json(bug);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bug" });
    }
  });

  app.delete("/api/bugs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBug(id);
      if (!deleted) {
        return res.status(404).json({ message: "Bug not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bug" });
    }
  });

  // Snippet routes
  app.get("/api/snippets", async (req, res) => {
    try {
      const { search, language, category } = req.query;
      const snippets = await storage.getSnippets(
        search as string,
        language as string,
        category as string
      );
      res.json(snippets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch snippets" });
    }
  });

  app.get("/api/snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const snippet = await storage.getSnippet(id);
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      res.json(snippet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch snippet" });
    }
  });

  app.post("/api/snippets", async (req, res) => {
    try {
      const validatedData = insertSnippetSchema.parse(req.body);
      const snippet = await storage.createSnippet(validatedData);
      res.status(201).json(snippet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create snippet" });
    }
  });

  app.put("/api/snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSnippetSchema.partial().parse(req.body);
      const snippet = await storage.updateSnippet(id, validatedData);
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      res.json(snippet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update snippet" });
    }
  });

  app.delete("/api/snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSnippet(id);
      if (!deleted) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete snippet" });
    }
  });

  app.post("/api/snippets/:id/use", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.incrementSnippetUsage(id);
      if (!success) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to increment snippet usage" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/analytics/activity", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const activity = await storage.getActivityData(days);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity data" });
    }
  });

  app.get("/api/analytics/technologies", async (req, res) => {
    try {
      const technologies = await storage.getTechnologyDistribution();
      res.json(technologies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch technology distribution" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
