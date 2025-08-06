import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const userId = "demo-user";
      const limit = parseInt(req.query.limit as string) || 50;
      
      const entries = await storage.getMoodEntriesByUser(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  } else if (req.method === 'POST') {
    try {
      const { mood, reflection, aiAnalysisEnabled } = req.body;
      const userId = "demo-user";
      
      const entry = await storage.createMoodEntry({
        mood,
        reflection,
        aiAnalysisEnabled,
        userId
      });

      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid mood entry data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 