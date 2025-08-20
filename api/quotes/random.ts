import { VercelRequest, VercelResponse } from '@vercel/node';

// Self-contained quotes to avoid cross-bundle imports in serverless runtime
const DEFAULT_QUOTES = [
  {
    text: "The best way to take care of the future is to take care of the present moment.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
    moodContext: ["anxious", "sad"],
  },
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "motivational",
    moodContext: ["sad", "neutral"],
  },
  {
    text: "The only way out is through.",
    author: "Robert Frost",
    category: "perseverance",
    moodContext: ["angry", "sad", "anxious"],
  },
  {
    text: "Every emotion is valid, but not every action is productive.",
    author: "Unknown",
    category: "emotional intelligence",
    moodContext: ["angry", "anxious"],
  },
  {
    text: "Your current situation is not your final destination.",
    author: "Unknown",
    category: "hope",
    moodContext: ["sad", "anxious"],
  },
  {
    text: "Celebrate small victories, they lead to great achievements.",
    author: "Unknown",
    category: "achievement",
    moodContext: ["happy", "excited", "neutral"],
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mood = (req.query.mood as string) || '';

    let candidates = DEFAULT_QUOTES;
    if (mood) {
      const filtered = DEFAULT_QUOTES.filter(q => q.moodContext?.includes(mood));
      candidates = filtered.length > 0 ? filtered : DEFAULT_QUOTES;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex];

    // Provide an id to match client expectations, without Node crypto
    const id = `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    return res.status(200).json({ id, ...chosen });
  } catch (_err) {
    return res.status(500).json({ error: 'Failed to fetch quote' });
  }
}