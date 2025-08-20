import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMoodEntrySchema, type MoodEntry } from "../shared/schema";
import { analyzeMoodWithAI, generatePersonalizedQuote, generatePatternInsights } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all mood entries for current user (demo user)
  app.get("/api/mood-entries", async (req, res) => {
    try {
      // For demo purposes, using a fixed user ID - in real app would get from auth
      const userId = "demo-user";
      const limit = parseInt(req.query.limit as string) || 50;
      
      const entries = await storage.getMoodEntriesByUser(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  });

  // Create a new mood entry
  app.post("/api/mood-entries", async (req, res) => {
    try {
      const validatedData = insertMoodEntrySchema.parse(req.body);
      const userId = "demo-user"; // Demo user ID
      
      // Create initial mood entry
      let moodEntry = await storage.createMoodEntry({
        ...validatedData,
        userId
      });

      // Perform AI analysis if enabled and reflection is provided
      if (validatedData.aiAnalysisEnabled && validatedData.reflection) {
        try {
          const aiAnalysis = await analyzeMoodWithAI(validatedData.reflection, validatedData.mood);
          
          // Update mood entry with AI insights
          moodEntry = await storage.updateMoodEntry(moodEntry.id, {
            aiInsights: aiAnalysis,
            sentiment: aiAnalysis.sentiment,
            confidence: aiAnalysis.confidence,
            tags: aiAnalysis.suggestedTags
          }) || moodEntry;
        } catch (aiError) {
          console.error("AI analysis failed:", aiError);
          // Continue without AI analysis - don't fail the entire request
        }
      }

      res.status(201).json(moodEntry);
    } catch (error) {
      console.error("Failed to create mood entry:", error);
      res.status(400).json({ error: "Invalid mood entry data" });
    }
  });

  // Get a random motivational quote
  app.get("/api/quotes/random", async (req, res) => {
    try {
      const mood = req.query.mood as string;
      const quote = await storage.getRandomQuote(mood);
      
      if (!quote) {
        return res.status(404).json({ error: "No quotes found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  // Generate personalized quote using AI
  app.post("/api/quotes/personalized", async (req, res) => {
    try {
      const { mood, recentReflections = [] } = req.body;
      
      if (!mood) {
        return res.status(400).json({ error: "Mood is required" });
      }

      const personalizedQuote = await generatePersonalizedQuote(mood, recentReflections);
      res.json(personalizedQuote);
    } catch (error) {
      console.error("Failed to generate personalized quote:", error);
      res.status(500).json({ error: "Failed to generate personalized quote" });
    }
  });

  // Get AI insights based on mood patterns
  app.get("/api/insights", async (req, res) => {
    try {
      const userId = "demo-user";
      const moodHistory = await storage.getMoodEntriesByUser(userId, 20);
      
      if (moodHistory.length === 0) {
        return res.json([]);
      }

      const insights = await generatePatternInsights(
        moodHistory.map(entry => ({
          mood: entry.mood,
          reflection: entry.reflection || undefined,
          timestamp: new Date(entry.timestamp!)
        }))
      );

      res.json(insights);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  // Get weekly mood summary analytics
  app.get("/api/analytics/weekly", async (req, res) => {
    try {
      const userId = "demo-user";
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentEntries = await storage.getMoodEntriesByUser(userId, 50);
      const weeklyEntries = recentEntries.filter(entry => 
        new Date(entry.timestamp!) >= oneWeekAgo
      );

      if (weeklyEntries.length === 0) {
        return res.json({
          dominantMood: 'neutral',
          frequency: 0,
          moodDistribution: []
        });
      }

      // Calculate mood distribution
      const moodCounts: Record<string, number> = {};
      weeklyEntries.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      // Find dominant mood
      const dominantMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

      // Calculate percentages
      const total = weeklyEntries.length;
      const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / total) * 100)
      }));

      res.json({
        dominantMood,
        frequency: moodCounts[dominantMood],
        moodDistribution
      });
    } catch (error) {
      console.error("Failed to get weekly analytics:", error);
      res.status(500).json({ error: "Failed to get weekly analytics" });
    }
  });

  // Get general analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const userId = "demo-user";
      const allEntries = await storage.getMoodEntriesByUser(userId, 1000);
      
      // Calculate streak (consecutive days with entries)
      const today = new Date();
      let streak = 0;
      const entryDates = new Set(
        allEntries.map(entry => 
          new Date(entry.timestamp!).toDateString()
        )
      );

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        if (entryDates.has(checkDate.toDateString())) {
          streak++;
        } else {
          break;
        }
      }

      // Calculate average happiness score
      const sentimentEntries = allEntries.filter(entry => entry.sentiment);
      const avgHappiness = sentimentEntries.length > 0
        ? sentimentEntries.reduce((sum, entry) => sum + (entry.sentiment || 0), 0) / sentimentEntries.length
        : 3;

      // Count AI insights
      const aiInsightsCount = allEntries.filter(entry => 
        entry.aiInsights && Array.isArray((entry.aiInsights as any)?.insights)
      ).length;

      res.json({
        totalEntries: allEntries.length,
        happinessScore: Math.round(avgHappiness * 10) / 10,
        streak,
        aiInsights: aiInsightsCount
      });
    } catch (error) {
      console.error("Failed to get analytics:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  // Delete a mood entry
  app.delete("/api/mood-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMoodEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Mood entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete mood entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
