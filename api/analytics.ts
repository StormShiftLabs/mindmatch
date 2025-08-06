import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const userId = "demo-user";
      const allEntries = await storage.getMoodEntriesByUser(userId, 1000);
      
      // Calculate streak
      const today = new Date();
      let streak = 0;
      const entryDates = new Set(
        allEntries.map(entry => new Date(entry.timestamp).toDateString())
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

      // Calculate average happiness
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
      res.status(500).json({ error: "Failed to get analytics" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 