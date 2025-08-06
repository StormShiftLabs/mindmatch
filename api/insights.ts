import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const userId = "demo-user";
      const moodHistory = await storage.getMoodEntriesByUser(userId, 20);
      
      if (moodHistory.length === 0) {
        return res.json([]);
      }

      // Simple insights based on mood patterns
      const insights = [];
      const recentMoods = moodHistory.slice(0, 7);
      
      if (recentMoods.length > 0) {
        const moodCounts = {};
        recentMoods.forEach(entry => {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        
        const dominantMood = Object.entries(moodCounts)
          .sort(([,a], [,b]) => b - a)[0][0];
        
        insights.push({
          type: "pattern",
          title: "Mood Pattern Detected",
          description: `You've been feeling ${dominantMood} frequently this week. Consider what might be contributing to this pattern.`,
          confidence: 85,
          actionable: true
        });
      }

      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate insights" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 