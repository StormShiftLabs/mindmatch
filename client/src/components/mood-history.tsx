import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, Download, Trash2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTimestamp, getMoodOption, getSentimentLabel } from "@/lib/mood-utils";
import type { MoodEntry } from "@shared/schema";

/**
 * Mood history component with filtering and management
 */
export function MoodHistory() {
  const [filter, setFilter] = useState("week");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch mood entries
  const { data: moodEntries = [], isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  // Delete mood entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/mood-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/weekly"] });
      toast({
        title: "Entry deleted",
        description: "Mood entry has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete entry",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Filter entries based on selected timeframe
  const filteredEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp!);
    const now = new Date();
    
    switch (filter) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      default:
        return true;
    }
  });

  const handleExport = () => {
    try {
      const exportData = moodEntries.map(entry => ({
        date: new Date(entry.timestamp!).toISOString(),
        mood: entry.mood,
        reflection: entry.reflection || "",
        sentiment: entry.sentiment || "",
        tags: entry.tags?.join(", ") || "",
        aiInsights: entry.aiInsights ? "Yes" : "No"
      }));

      const csv = [
        "Date,Mood,Reflection,Sentiment,Tags,AI Insights",
        ...exportData.map(row => 
          `"${row.date}","${row.mood}","${row.reflection.replace(/"/g, '""')}","${row.sentiment}","${row.tags}","${row.aiInsights}"`
        )
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindmatch-mood-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your mood data has been downloaded as a CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export mood data. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-border/30">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <History className="text-primary mr-3 h-6 w-6" />
            Recent Entries
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px] bg-background/50 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              className="hover:bg-secondary/50"
              disabled={moodEntries.length === 0}
              aria-label="Export mood data"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96 custom-scrollbar">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No entries found</h3>
              <p className="text-sm text-muted-foreground">
                {filter === "all" 
                  ? "Start logging your moods to see them here."
                  : `No mood entries in the selected ${filter} period.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const moodOption = getMoodOption(entry.mood as any);
                return (
                  <div
                    key={entry.id}
                    className="flex items-start space-x-4 p-4 hover:bg-background/30 rounded-xl transition-colors animate-fade-in group"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 bg-${moodOption.color}/20 rounded-xl flex items-center justify-center`}>
                        <span className="text-2xl">{moodOption.emoji}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${moodOption.color}`}>
                          {moodOption.label}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(entry.timestamp!)}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete mood entry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this mood entry and any associated AI insights.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(entry.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {entry.reflection && (
                        <p className="text-muted-foreground text-sm leading-relaxed mb-2 line-clamp-2">
                          {entry.reflection}
                        </p>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-2">
                        {entry.sentiment && (
                          <Badge variant="secondary" className="text-xs">
                            {getSentimentLabel(entry.sentiment)}
                          </Badge>
                        )}
                        
                        {entry.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        
                        {entry.aiInsights && typeof entry.aiInsights === 'object' && (
                          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                            AI Analyzed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
