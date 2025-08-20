import express from 'express';

// Simple in-memory store for serverless runtime
type MoodType = 'happy' | 'sad' | 'angry' | 'anxious' | 'excited' | 'neutral';
interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodType;
  reflection: string | null;
  aiAnalysisEnabled: boolean;
  aiInsights: unknown | null;
  sentiment: number | null; // 1-5
  confidence: number | null; // 0-100
  tags: string[] | null;
  timestamp: string; // ISO
}

const moodEntries: MoodEntry[] = [];

// Quotes dataset
const QUOTES = [
  { text: 'The best way to take care of the future is to take care of the present moment.', author: 'Thich Nhat Hanh', category: 'mindfulness', moodContext: ['anxious', 'sad'] },
  { text: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama', category: 'motivational', moodContext: ['sad', 'neutral'] },
  { text: 'The only way out is through.', author: 'Robert Frost', category: 'perseverance', moodContext: ['angry', 'sad', 'anxious'] },
  { text: 'Every emotion is valid, but not every action is productive.', author: 'Unknown', category: 'emotional intelligence', moodContext: ['angry', 'anxious'] },
  { text: 'Your current situation is not your final destination.', author: 'Unknown', category: 'hope', moodContext: ['sad', 'anxious'] },
  { text: 'Celebrate small victories, they lead to great achievements.', author: 'Unknown', category: 'achievement', moodContext: ['happy', 'excited', 'neutral'] }
];

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Quotes: GET /api/quotes/random?mood=happy
app.get('/api/quotes/random', (req, res) => {
  const mood = String(req.query.mood || '');
  let candidates = QUOTES;
  if (mood) {
    const filtered = QUOTES.filter(q => q.moodContext?.includes(mood));
    candidates = filtered.length ? filtered : QUOTES;
  }
  const q = candidates[Math.floor(Math.random() * candidates.length)];
  const id = `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  res.json({ id, ...q });
});

// Mood entries: GET /api/mood-entries?limit=50
app.get('/api/mood-entries', (req, res) => {
  const userId = 'demo-user';
  const limit = Number(req.query.limit || 50);
  const items = moodEntries
    .filter(e => e.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
  res.json(items);
});

// Mood entries: POST /api/mood-entries
app.post('/api/mood-entries', (req, res) => {
  try {
    const { mood, reflection = null, aiAnalysisEnabled = true } = req.body || {};
    const allowed: MoodType[] = ['happy','sad','angry','anxious','excited','neutral'];
    if (!allowed.includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood' });
    }
    const entry: MoodEntry = {
      id: `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
      userId: 'demo-user',
      mood,
      reflection,
      aiAnalysisEnabled: Boolean(aiAnalysisEnabled),
      aiInsights: null,
      sentiment: null,
      confidence: null,
      tags: null,
      timestamp: new Date().toISOString()
    };
    moodEntries.unshift(entry);
    res.status(201).json(entry);
  } catch (_e) {
    res.status(400).json({ error: 'Invalid mood entry data' });
  }
});

// Analytics: GET /api/analytics
app.get('/api/analytics', (_req, res) => {
  const userId = 'demo-user';
  const all = moodEntries.filter(e => e.userId === userId);
  const today = new Date();
  let streak = 0;
  const days = new Set(all.map(e => new Date(e.timestamp).toDateString()));
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) streak++; else break;
  }
  const withSentiment = all.filter(e => typeof e.sentiment === 'number') as Array<Required<Pick<MoodEntry,'sentiment'>> & MoodEntry>;
  const avg = withSentiment.length ? withSentiment.reduce((s, e) => s + (e.sentiment || 0), 0) / withSentiment.length : 3;
  const aiCount = all.filter(e => !!e.aiInsights && Array.isArray((e.aiInsights as any)?.insights)).length;
  res.json({ totalEntries: all.length, happinessScore: Math.round(avg * 10) / 10, streak, aiInsights: aiCount });
});

export default app;