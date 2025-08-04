import { type User, type InsertUser, type MoodEntry, type InsertMoodEntry, type MotivationalQuote, type InsertMotivationalQuote } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Mood entry operations
  getMoodEntry(id: string): Promise<MoodEntry | undefined>;
  getMoodEntriesByUser(userId: string, limit?: number): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry & { userId: string }): Promise<MoodEntry>;
  updateMoodEntry(id: string, updates: Partial<MoodEntry>): Promise<MoodEntry | undefined>;
  deleteMoodEntry(id: string): Promise<boolean>;

  // Quote operations
  getRandomQuote(moodContext?: string): Promise<MotivationalQuote | undefined>;
  getAllQuotes(): Promise<MotivationalQuote[]>;
  createQuote(quote: InsertMotivationalQuote): Promise<MotivationalQuote>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private moodEntries: Map<string, MoodEntry>;
  private quotes: Map<string, MotivationalQuote>;

  constructor() {
    this.users = new Map();
    this.moodEntries = new Map();
    this.quotes = new Map();
    this.initializeDefaultQuotes();
  }

  private initializeDefaultQuotes() {
    const defaultQuotes: InsertMotivationalQuote[] = [
      {
        text: "The best way to take care of the future is to take care of the present moment.",
        author: "Thich Nhat Hanh",
        category: "mindfulness",
        moodContext: ["anxious", "sad"]
      },
      {
        text: "Happiness is not something ready made. It comes from your own actions.",
        author: "Dalai Lama",
        category: "motivational",
        moodContext: ["sad", "neutral"]
      },
      {
        text: "The only way out is through.",
        author: "Robert Frost",
        category: "perseverance",
        moodContext: ["angry", "sad", "anxious"]
      },
      {
        text: "Every emotion is valid, but not every action is productive.",
        author: "Unknown",
        category: "emotional intelligence",
        moodContext: ["angry", "anxious"]
      },
      {
        text: "Your current situation is not your final destination.",
        author: "Unknown",
        category: "hope",
        moodContext: ["sad", "anxious"]
      },
      {
        text: "Celebrate small victories, they lead to great achievements.",
        author: "Unknown",
        category: "achievement",
        moodContext: ["happy", "excited", "neutral"]
      }
    ];

    defaultQuotes.forEach(quote => {
      this.createQuote(quote);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      firstName: insertUser.firstName || null,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getMoodEntry(id: string): Promise<MoodEntry | undefined> {
    return this.moodEntries.get(id);
  }

  async getMoodEntriesByUser(userId: string, limit = 50): Promise<MoodEntry[]> {
    const userEntries = Array.from(this.moodEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
    
    return userEntries;
  }

  async createMoodEntry(entryData: InsertMoodEntry & { userId: string }): Promise<MoodEntry> {
    const id = randomUUID();
    const entry: MoodEntry = {
      ...entryData,
      reflection: entryData.reflection || null,
      tags: entryData.tags || null,
      id,
      timestamp: new Date(),
      aiInsights: null,
      sentiment: null,
      confidence: null,
    };
    this.moodEntries.set(id, entry);
    return entry;
  }

  async updateMoodEntry(id: string, updates: Partial<MoodEntry>): Promise<MoodEntry | undefined> {
    const existing = this.moodEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.moodEntries.set(id, updated);
    return updated;
  }

  async deleteMoodEntry(id: string): Promise<boolean> {
    return this.moodEntries.delete(id);
  }

  async getRandomQuote(moodContext?: string): Promise<MotivationalQuote | undefined> {
    const allQuotes = Array.from(this.quotes.values());
    let relevantQuotes = allQuotes;
    
    if (moodContext) {
      relevantQuotes = allQuotes.filter(quote => 
        quote.moodContext?.includes(moodContext)
      );
      
      // If no mood-specific quotes, fall back to all quotes
      if (relevantQuotes.length === 0) {
        relevantQuotes = allQuotes;
      }
    }
    
    if (relevantQuotes.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * relevantQuotes.length);
    return relevantQuotes[randomIndex];
  }

  async getAllQuotes(): Promise<MotivationalQuote[]> {
    return Array.from(this.quotes.values());
  }

  async createQuote(quoteData: InsertMotivationalQuote): Promise<MotivationalQuote> {
    const id = randomUUID();
    const quote: MotivationalQuote = {
      ...quoteData,
      category: quoteData.category || null,
      moodContext: quoteData.moodContext || null,
      id,
    };
    this.quotes.set(id, quote);
    return quote;
  }
}

export const storage = new MemStorage();
