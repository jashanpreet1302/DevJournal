import { 
  journalEntries, 
  bugs, 
  snippets,
  type JournalEntry, 
  type InsertJournalEntry,
  type Bug,
  type InsertBug,
  type Snippet,
  type InsertSnippet,
  type DashboardStats,
  type ActivityData,
  type TechnologyDistribution
} from "@shared/schema";

export interface IStorage {
  // Journal operations
  getJournalEntries(search?: string, difficulty?: string, source?: string): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // Bug operations
  getBugs(search?: string, status?: string, priority?: string): Promise<Bug[]>;
  getBug(id: number): Promise<Bug | undefined>;
  createBug(bug: InsertBug): Promise<Bug>;
  updateBug(id: number, bug: Partial<InsertBug>): Promise<Bug | undefined>;
  deleteBug(id: number): Promise<boolean>;

  // Snippet operations
  getSnippets(search?: string, language?: string, category?: string): Promise<Snippet[]>;
  getSnippet(id: number): Promise<Snippet | undefined>;
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
  updateSnippet(id: number, snippet: Partial<InsertSnippet>): Promise<Snippet | undefined>;
  deleteSnippet(id: number): Promise<boolean>;
  incrementSnippetUsage(id: number): Promise<boolean>;

  // Analytics operations
  getDashboardStats(): Promise<DashboardStats>;
  getActivityData(days: number): Promise<ActivityData[]>;
  getTechnologyDistribution(): Promise<TechnologyDistribution[]>;
}

export class MemStorage implements IStorage {
  private journalEntries: Map<number, JournalEntry> = new Map();
  private bugs: Map<number, Bug> = new Map();
  private snippets: Map<number, Snippet> = new Map();
  private currentJournalId = 1;
  private currentBugId = 1;
  private currentSnippetId = 1;

  constructor() {
    // Initialize with empty data
  }

  // Journal operations
  async getJournalEntries(search?: string, difficulty?: string, source?: string): Promise<JournalEntry[]> {
    let entries = Array.from(this.journalEntries.values());
    
    if (search) {
      entries = entries.filter(entry => 
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.content.toLowerCase().includes(search.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (difficulty && difficulty !== 'all') {
      entries = entries.filter(entry => entry.difficulty === difficulty);
    }
    
    if (source && source !== 'all') {
      entries = entries.filter(entry => entry.source === source);
    }
    
    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentJournalId++;
    const newEntry: JournalEntry = {
      id,
      title: entry.title,
      content: entry.content,
      difficulty: entry.difficulty,
      source: entry.source,
      tags: entry.tags || [],
      readTime: entry.readTime || 5,
      isBookmarked: entry.isBookmarked || 0,
      createdAt: new Date(),
    };
    this.journalEntries.set(id, newEntry);
    return newEntry;
  }

  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existing = this.journalEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...entry };
    this.journalEntries.set(id, updated);
    return updated;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // Bug operations
  async getBugs(search?: string, status?: string, priority?: string): Promise<Bug[]> {
    let bugs = Array.from(this.bugs.values());
    
    if (search) {
      bugs = bugs.filter(bug => 
        bug.title.toLowerCase().includes(search.toLowerCase()) ||
        bug.description.toLowerCase().includes(search.toLowerCase()) ||
        bug.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (status && status !== 'all') {
      bugs = bugs.filter(bug => bug.status === status);
    }
    
    if (priority && priority !== 'all') {
      bugs = bugs.filter(bug => bug.priority === priority);
    }
    
    return bugs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBug(id: number): Promise<Bug | undefined> {
    return this.bugs.get(id);
  }

  async createBug(bug: InsertBug): Promise<Bug> {
    const id = this.currentBugId++;
    const newBug: Bug = {
      id,
      title: bug.title,
      description: bug.description,
      solution: bug.solution || null,
      status: bug.status,
      priority: bug.priority,
      problemCode: bug.problemCode || null,
      solutionCode: bug.solutionCode || null,
      tags: bug.tags || [],
      resolutionTime: bug.resolutionTime || null,
      createdAt: new Date(),
      resolvedAt: bug.status === 'resolved' ? new Date() : null,
    };
    this.bugs.set(id, newBug);
    return newBug;
  }

  async updateBug(id: number, bug: Partial<InsertBug>): Promise<Bug | undefined> {
    const existing = this.bugs.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...bug,
      resolvedAt: bug.status === 'resolved' && existing.status !== 'resolved' ? new Date() : existing.resolvedAt
    };
    this.bugs.set(id, updated);
    return updated;
  }

  async deleteBug(id: number): Promise<boolean> {
    return this.bugs.delete(id);
  }

  // Snippet operations
  async getSnippets(search?: string, language?: string, category?: string): Promise<Snippet[]> {
    let snippets = Array.from(this.snippets.values());
    
    if (search) {
      snippets = snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(search.toLowerCase()) ||
        snippet.description.toLowerCase().includes(search.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (language && language !== 'all') {
      snippets = snippets.filter(snippet => snippet.language === language);
    }
    
    if (category && category !== 'all') {
      snippets = snippets.filter(snippet => snippet.category === category);
    }
    
    return snippets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSnippet(id: number): Promise<Snippet | undefined> {
    return this.snippets.get(id);
  }

  async createSnippet(snippet: InsertSnippet): Promise<Snippet> {
    const id = this.currentSnippetId++;
    const newSnippet: Snippet = {
      id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      category: snippet.category,
      tags: snippet.tags || [],
      timesUsed: snippet.timesUsed || 0,
      createdAt: new Date(),
    };
    this.snippets.set(id, newSnippet);
    return newSnippet;
  }

  async updateSnippet(id: number, snippet: Partial<InsertSnippet>): Promise<Snippet | undefined> {
    const existing = this.snippets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...snippet };
    this.snippets.set(id, updated);
    return updated;
  }

  async deleteSnippet(id: number): Promise<boolean> {
    return this.snippets.delete(id);
  }

  async incrementSnippetUsage(id: number): Promise<boolean> {
    const snippet = this.snippets.get(id);
    if (!snippet) return false;
    
    snippet.timesUsed++;
    this.snippets.set(id, snippet);
    return true;
  }

  // Analytics operations
  async getDashboardStats(): Promise<DashboardStats> {
    const journalEntries = Array.from(this.journalEntries.values());
    const bugs = Array.from(this.bugs.values());
    const snippets = Array.from(this.snippets.values());
    
    const resolvedBugs = bugs.filter(bug => bug.status === 'resolved');
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const weeklyJournalEntries = journalEntries.filter(entry => entry.createdAt > lastWeek);
    const weeklyResolvedBugs = resolvedBugs.filter(bug => bug.resolvedAt && bug.resolvedAt > lastWeek);
    
    // Calculate streak (simplified - consecutive days with journal entries)
    const sortedEntries = journalEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return {
      totalInsights: journalEntries.length,
      bugsResolved: resolvedBugs.length,
      snippets: snippets.length,
      streak,
      weeklyGrowth: {
        insights: Math.round((weeklyJournalEntries.length / Math.max(journalEntries.length - weeklyJournalEntries.length, 1)) * 100),
        bugs: Math.round((weeklyResolvedBugs.length / Math.max(resolvedBugs.length - weeklyResolvedBugs.length, 1)) * 100),
      }
    };
  }

  async getActivityData(days: number): Promise<ActivityData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const journalEntries = Array.from(this.journalEntries.values());
    const bugs = Array.from(this.bugs.values());
    const snippets = Array.from(this.snippets.values());
    
    const activityData: ActivityData[] = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      activityData.push({
        date: dateStr,
        journalEntries: journalEntries.filter(entry => 
          entry.createdAt >= dayStart && entry.createdAt < dayEnd
        ).length,
        bugsResolved: bugs.filter(bug => 
          bug.resolvedAt && bug.resolvedAt >= dayStart && bug.resolvedAt < dayEnd
        ).length,
        snippetsAdded: snippets.filter(snippet => 
          snippet.createdAt >= dayStart && snippet.createdAt < dayEnd
        ).length,
      });
    }
    
    return activityData;
  }

  async getTechnologyDistribution(): Promise<TechnologyDistribution[]> {
    const allTags = new Map<string, number>();
    
    // Collect tags from all entries
    Array.from(this.journalEntries.values()).forEach(entry => {
      entry.tags.forEach(tag => {
        allTags.set(tag, (allTags.get(tag) || 0) + 1);
      });
    });
    
    Array.from(this.bugs.values()).forEach(bug => {
      bug.tags.forEach(tag => {
        allTags.set(tag, (allTags.get(tag) || 0) + 1);
      });
    });
    
    Array.from(this.snippets.values()).forEach(snippet => {
      snippet.tags.forEach(tag => {
        allTags.set(tag, (allTags.get(tag) || 0) + 1);
      });
    });
    
    const total = Array.from(allTags.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(allTags.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 technologies
  }
}

export const storage = new MemStorage();
