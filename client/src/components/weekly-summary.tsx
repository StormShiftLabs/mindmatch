import { useQuery } from "@tanstack/react-query";
import { PieChart, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMoodOption } from "@/lib/mood-utils";
import type { WeeklySummary } from "@shared/schema";

/**
 * Weekly mood summary component with distribution chart
 */
export function WeeklySummary() {
  const { data: summary, isLoading } = useQuery<WeeklySummary>({
    queryKey: ["/api/analytics/weekly"],
  });

  if (isLoading) {
    return (
      <Card className="glass-effect border-border/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <PieChart className="text-primary mr-3 h-5 w-5" />
            This Week's Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-24 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="h-2 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.moodDistribution.length === 0) {
    return (
      <Card className="glass-effect border-border/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <PieChart className="text-primary mr-3 h-5 w-5" />
            This Week's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No data this week</h3>
            <p className="text-sm text-muted-foreground">
              Start logging your moods to see your weekly summary.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dominantMoodOption = getMoodOption(summary.dominantMood as any);

  return (
    <Card className="glass-effect border-border/30">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <PieChart className="text-primary mr-3 h-5 w-5" />
          This Week's Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dominant Mood Display */}
        <div className="text-center">
          <div className="text-6xl mb-2 animate-pulse-gentle">
            {dominantMoodOption.emoji}
          </div>
          <p className={`text-lg font-medium ${dominantMoodOption.color} mb-1`}>
            {dominantMoodOption.label}
          </p>
          <p className="text-sm text-muted-foreground">
            appeared {summary.frequency} time{summary.frequency !== 1 ? 's' : ''} this week
          </p>
        </div>

        {/* Mood Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Mood Distribution
          </h4>
          {summary.moodDistribution
            .sort((a, b) => b.percentage - a.percentage)
            .map(({ mood, count, percentage }) => {
              const moodOption = getMoodOption(mood as any);
              return (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{moodOption.emoji}</span>
                    <span className={`text-sm font-medium ${moodOption.color}`}>
                      {moodOption.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({count})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 flex-1 max-w-[120px]">
                    <Progress 
                      value={percentage} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
