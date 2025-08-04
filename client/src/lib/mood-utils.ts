import type { MoodType, MoodOption } from "@shared/schema";

/**
 * Available mood options with their visual properties
 */
export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    color: "mood-happy"
  },
  {
    id: "sad",
    label: "Sad", 
    emoji: "😢",
    color: "mood-sad"
  },
  {
    id: "angry",
    label: "Angry",
    emoji: "😡", 
    color: "mood-angry"
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "😬",
    color: "mood-anxious"
  },
  {
    id: "excited",
    label: "Excited",
    emoji: "🤩",
    color: "mood-excited"
  },
  {
    id: "neutral",
    label: "Neutral",
    emoji: "😐",
    color: "mood-neutral"
  }
];

/**
 * Get mood option by ID
 */
export function getMoodOption(mood: MoodType): MoodOption {
  return MOOD_OPTIONS.find(option => option.id === mood) || MOOD_OPTIONS[5]; // Default to neutral
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get sentiment label from score
 */
export function getSentimentLabel(sentiment?: number | null): string {
  if (!sentiment) return "Unknown";
  
  if (sentiment >= 4.5) return "Very Positive";
  if (sentiment >= 3.5) return "Positive";
  if (sentiment >= 2.5) return "Neutral";
  if (sentiment >= 1.5) return "Negative";
  return "Very Negative";
}

/**
 * Get current date string for display
 */
export function getCurrentDateString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate mood streak (consecutive days with entries)
 */
export function calculateStreak(timestamps: (Date | string)[]): number {
  if (timestamps.length === 0) return 0;

  const dates = timestamps
    .map(ts => new Date(ts).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort newest first

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < dates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    if (dates.includes(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generate color class for mood
 */
export function getMoodColorClass(mood: MoodType, type: 'text' | 'bg' | 'border' = 'text'): string {
  const moodOption = getMoodOption(mood);
  switch (type) {
    case 'bg':
      return `bg-${moodOption.color}`;
    case 'border':
      return `border-${moodOption.color}`;
    default:
      return moodOption.color;
  }
}
