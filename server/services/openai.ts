import OpenAI from "openai";
import type { AIInsight } from "../../shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface MoodAnalysisResult {
  detectedMood: string;
  sentiment: number; // 1-5 scale
  confidence: number; // 0-100 scale
  insights: AIInsight[];
  suggestedTags: string[];
  emotionalIntensity: number; // 1-10 scale
}

/**
 * Analyzes mood and emotions from user's reflection text using AI
 */
export async function analyzeMoodWithAI(
  reflection: string,
  selectedMood: string
): Promise<MoodAnalysisResult> {
  try {
    const prompt = `
    Analyze the following emotional reflection and provide insights. The user selected "${selectedMood}" as their mood.
    
    Reflection: "${reflection}"
    
    Please provide a comprehensive mood analysis in JSON format with the following structure:
    {
      "detectedMood": "string (one of: happy, sad, angry, anxious, excited, neutral)",
      "sentiment": number (1-5 scale where 1=very negative, 5=very positive),
      "confidence": number (0-100 confidence in analysis),
      "insights": [
        {
          "type": "string (pattern/trend/suggestion/warning)",
          "title": "string (brief insight title)",
          "description": "string (detailed insight)",
          "confidence": number (0-100),
          "actionable": boolean
        }
      ],
      "suggestedTags": ["array of relevant tags like work, relationship, health, etc"],
      "emotionalIntensity": number (1-10 scale of emotional intensity)
    }
    
    Focus on providing helpful, supportive insights that could help with emotional awareness and growth.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert emotional wellness AI assistant specializing in mood analysis and mental health insights. Provide compassionate, accurate, and actionable emotional analysis."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and sanitize the response
    return {
      detectedMood: result.detectedMood || selectedMood,
      sentiment: Math.max(1, Math.min(5, Math.round(result.sentiment || 3))),
      confidence: Math.max(0, Math.min(100, Math.round(result.confidence || 50))),
      insights: Array.isArray(result.insights) ? result.insights.slice(0, 3) : [],
      suggestedTags: Array.isArray(result.suggestedTags) ? result.suggestedTags.slice(0, 5) : [],
      emotionalIntensity: Math.max(1, Math.min(10, Math.round(result.emotionalIntensity || 5)))
    };
  } catch (error) {
    console.error("AI mood analysis failed:", error);
    
    // Fallback analysis based on selected mood
    return getFallbackAnalysis(selectedMood, reflection);
  }
}

/**
 * Generates personalized motivational content based on current mood and context
 */
export async function generatePersonalizedQuote(
  mood: string,
  recentReflections: string[]
): Promise<{ text: string; author: string; category: string }> {
  try {
    const prompt = `
    Generate a personalized motivational quote for someone feeling "${mood}".
    
    Recent context from their reflections: ${recentReflections.join(". ")}
    
    Provide a response in JSON format:
    {
      "text": "inspirational quote text",
      "author": "quote author (can be 'Anonymous' if original)",
      "category": "quote category (motivational/calming/inspiring/empowering)"
    }
    
    Make it relevant to their current emotional state and supportive.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a compassionate wellness coach who creates personalized motivational content for emotional support."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      text: result.text || "Every step forward is progress, no matter how small.",
      author: result.author || "Anonymous",
      category: result.category || "motivational"
    };
  } catch (error) {
    console.error("Quote generation failed:", error);
    
    // Fallback quotes based on mood
    const fallbackQuotes = {
      happy: { text: "Happiness is not a destination, it's a way of life.", author: "Burton Hills", category: "joy" },
      sad: { text: "It's okay to not be okay. Healing takes time.", author: "Anonymous", category: "comfort" },
      angry: { text: "Anger is energy. Channel it into positive change.", author: "Anonymous", category: "empowerment" },
      anxious: { text: "You are braver than you believe and stronger than you seem.", author: "A.A. Milne", category: "courage" },
      excited: { text: "Let your enthusiasm light up the world around you.", author: "Anonymous", category: "inspiration" },
      neutral: { text: "In stillness, we find clarity and peace.", author: "Anonymous", category: "mindfulness" }
    };
    
    return fallbackQuotes[mood as keyof typeof fallbackQuotes] || fallbackQuotes.neutral;
  }
}

/**
 * Analyzes mood patterns and generates insights
 */
export async function generatePatternInsights(
  moodHistory: Array<{ mood: string; reflection?: string; timestamp: Date }>
): Promise<AIInsight[]> {
  try {
    const recentMoods = moodHistory.slice(0, 14); // Last 2 weeks
    const moodSummary = recentMoods.map(entry => 
      `${entry.mood} on ${entry.timestamp.toDateString()}: ${entry.reflection || 'No reflection'}`
    ).join('\n');

    const prompt = `
    Analyze the following mood history patterns and provide actionable insights in JSON format:
    
    ${moodSummary}
    
    Provide an array of insights:
    [
      {
        "type": "pattern/trend/suggestion/warning",
        "title": "brief insight title",
        "description": "detailed actionable insight",
        "confidence": number (0-100),
        "actionable": boolean
      }
    ]
    
    Focus on helpful patterns, trends, and suggestions for emotional wellness.
    Limit to maximum 3 most important insights.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in emotional pattern analysis and mental wellness coaching."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");
    return Array.isArray(result) ? result.slice(0, 3) : [];
  } catch (error) {
    console.error("Pattern analysis failed:", error);
    return [];
  }
}

/**
 * Fallback analysis when AI is unavailable
 */
function getFallbackAnalysis(mood: string, reflection: string): MoodAnalysisResult {
  const moodMapping = {
    happy: { sentiment: 4, intensity: 6 },
    excited: { sentiment: 5, intensity: 8 },
    neutral: { sentiment: 3, intensity: 3 },
    sad: { sentiment: 2, intensity: 6 },
    anxious: { sentiment: 2, intensity: 7 },
    angry: { sentiment: 1, intensity: 8 }
  };

  const moodData = moodMapping[mood as keyof typeof moodMapping] || { sentiment: 3, intensity: 5 };
  
  return {
    detectedMood: mood,
    sentiment: moodData.sentiment,
    confidence: 75,
    insights: [{
      type: "suggestion",
      title: "Keep tracking your emotions",
      description: "Regular mood tracking helps build emotional awareness and identify patterns over time.",
      confidence: 90,
      actionable: true
    }],
    suggestedTags: ["general", "wellness"],
    emotionalIntensity: moodData.intensity
  };
}
