import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
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
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 