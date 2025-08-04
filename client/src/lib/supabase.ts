import { createClient } from '@supabase/supabase-js';
import type { MoodEntry, MotivationalQuote } from '@shared/schema';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase database operations for mood entries
 */
export class SupabaseStorage {
  /**
   * Create a new mood entry in Supabase
   */
  static async createMoodEntry(entry: Omit<MoodEntry, 'id' | 'timestamp'>) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('mood_entries')
      .insert([{
        ...entry,
        timestamp: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get mood entries for a specific user
   */
  static async getMoodEntriesByUser(userId: string, limit = 50) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Update a mood entry with AI insights
   */
  static async updateMoodEntry(id: string, updates: Partial<MoodEntry>) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('mood_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a mood entry
   */
  static async deleteMoodEntry(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  /**
   * Get a random motivational quote
   */
  static async getRandomQuote(moodContext?: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    let query = supabase
      .from('motivational_quotes')
      .select('*');

    if (moodContext) {
      query = query.contains('mood_context', [moodContext]);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    // Return random quote
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  /**
   * Create user profile after authentication
   */
  static async createUserProfile(userId: string, userData: { 
    email: string; 
    name: string; 
    avatar_url?: string; 
  }) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{
        id: userId,
        ...userData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!supabase;
}