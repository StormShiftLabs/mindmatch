import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Mic, MicOff, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { apiRequest } from "@/lib/queryClient";
import { MOOD_OPTIONS, getCurrentDateString } from "@/lib/mood-utils";
import type { MoodType } from "@shared/schema";

/**
 * Mood logging component with AI analysis and voice input
 */
export function MoodLogger() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [reflection, setReflection] = useState("");
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Voice input integration
  const {
    isListening,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    transcript
  } = useVoiceInput({
    onResult: (result) => {
      setReflection(prev => prev + (prev ? " " : "") + result);
      toast({
        title: "Voice input captured",
        description: "Your voice has been transcribed to text.",
      });
    },
    onError: (error) => {
      toast({
        title: "Voice input error",
        description: error,
        variant: "destructive"
      });
    }
  });

  // Mood submission mutation
  const submitMoodMutation = useMutation({
    mutationFn: async (data: { mood: MoodType; reflection: string; aiAnalysisEnabled: boolean }) => {
      return apiRequest("POST", "/api/mood-entries", data);
    },
    onSuccess: () => {
      // Reset form
      setSelectedMood(null);
      setReflection("");
      
      // Invalidate and refetch mood entries
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/weekly"] });
      
      toast({
        title: "Mood logged successfully! 🎉",
        description: aiAnalysisEnabled 
          ? "Your mood has been saved and analyzed by AI."
          : "Your mood has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to log mood",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling before submitting.",
        variant: "destructive"
      });
      return;
    }

    submitMoodMutation.mutate({
      mood: selectedMood,
      reflection: reflection.trim(),
      aiAnalysisEnabled
    });
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Card className="glass-effect border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Heart className="text-primary mr-3 h-6 w-6" />
            Log Your Mood
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {getCurrentDateString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mood Selection Grid */}
        <div>
          <Label className="text-base font-medium mb-4 block">How are you feeling?</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {MOOD_OPTIONS.map((mood) => (
              <Button
                key={mood.id}
                variant="outline"
                className={`p-4 h-auto flex-col space-y-2 border-2 transition-all duration-200 hover-scale ${
                  selectedMood === mood.id
                    ? `border-${mood.color} bg-${mood.color}/10`
                    : `border-transparent hover:border-${mood.color} hover:bg-${mood.color}/10`
                }`}
                onClick={() => setSelectedMood(mood.id)}
              >
                <span className="text-3xl transform transition-transform group-hover:scale-110">
                  {mood.emoji}
                </span>
                <span className={`text-sm font-medium ${mood.color}`}>
                  {mood.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Reflection Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="reflection" className="text-base font-medium flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              What's on your mind? (Optional)
            </Label>
            {voiceSupported && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceToggle}
                className={`transition-colors ${isListening ? 'border-red-500 text-red-500' : ''}`}
                disabled={submitMoodMutation.isPending}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Voice
                  </>
                )}
              </Button>
            )}
          </div>
          
          <Textarea
            id="reflection"
            placeholder="Share your thoughts, feelings, or what led to this mood..."
            value={reflection + (isListening && transcript ? ` ${transcript}` : "")}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[100px] bg-background/50 border-border/30 focus:border-primary/50 resize-none custom-scrollbar"
            disabled={submitMoodMutation.isPending}
          />
          
          {isListening && (
            <p className="text-sm text-muted-foreground animate-pulse">
              🎤 Listening... Speak your thoughts
            </p>
          )}
        </div>

        {/* AI Analysis Toggle */}
        <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <div>
            <Label htmlFor="ai-analysis" className="font-medium text-primary flex items-center cursor-pointer">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Mood Analysis
            </Label>
            <p className="text-sm text-muted-foreground">
              Get personalized insights about your emotional patterns
            </p>
          </div>
          <Switch
            id="ai-analysis"
            checked={aiAnalysisEnabled}
            onCheckedChange={setAiAnalysisEnabled}
            disabled={submitMoodMutation.isPending}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || submitMoodMutation.isPending}
          className="w-full mood-gradient hover:opacity-90 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {submitMoodMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {aiAnalysisEnabled ? "Analyzing & Saving..." : "Saving..."}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Log My Mood
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
