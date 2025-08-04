import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  mood: text("mood").notNull(), // 'happy', 'sad', 'angry', 'anxious', 'excited', 'neutral'
  reflection: text("reflection"),
  aiAnalysisEnabled: boolean("ai_analysis_enabled").default(true),
  aiInsights: jsonb("ai_insights"), // AI analysis results
  sentiment: integer("sentiment"), // 1-5 scale
  confidence: integer("confidence"), // 0-100 scale
  tags: text("tags").array(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const motivationalQuotes = pgTable("motivational_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  author: text("author").notNull(),
  category: text("category"), // 'motivational', 'calming', 'inspiring'
  moodContext: text("mood_context").array(), // which moods this quote is good for
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  userId: true,
  timestamp: true,
  aiInsights: true,
  sentiment: true,
  confidence: true,
});

export const insertQuoteSchema = createInsertSchema(motivationalQuotes).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MotivationalQuote = typeof motivationalQuotes.$inferSelect;
export type InsertMotivationalQuote = z.infer<typeof insertQuoteSchema>;

// Frontend-only types for better UX
export type MoodType = 'happy' | 'sad' | 'angry' | 'anxious' | 'excited' | 'neutral';

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji: string;
  color: string;
}

export interface WeeklySummary {
  dominantMood: MoodType;
  frequency: number;
  moodDistribution: Array<{
    mood: MoodType;
    count: number;
    percentage: number;
  }>;
}

export interface AIInsight {
  type: 'pattern' | 'trend' | 'suggestion' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable?: boolean;
}
