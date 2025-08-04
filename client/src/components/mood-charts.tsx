import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
  Legend
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMoodOption } from "@/lib/mood-utils";
import type { MoodEntry, MoodType } from "@shared/schema";
import { useState } from "react";

/**
 * Advanced mood visualization charts using Recharts
 */
export function MoodCharts() {
  const [timeframe, setTimeframe] = useState("30");
  
  const { data: moodEntries = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  // Process data for charts
  const chartData = useMemo(() => {
    const days = parseInt(timeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEntries = moodEntries.filter(entry => 
      new Date(entry.timestamp!) >= cutoffDate
    );

    // Mood trend data (daily sentiment scores)
    const dailyData: Record<string, { date: string; sentiment: number; count: number }> = {};
    
    recentEntries.forEach(entry => {
      const date = new Date(entry.timestamp!).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!dailyData[date]) {
        dailyData[date] = { date, sentiment: 0, count: 0 };
      }
      
      if (entry.sentiment) {
        dailyData[date].sentiment += entry.sentiment;
        dailyData[date].count += 1;
      }
    });

    const trendData = Object.values(dailyData)
      .map(day => ({
        ...day,
        sentiment: day.count > 0 ? Number((day.sentiment / day.count).toFixed(1)) : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Mood distribution data
    const moodCounts: Record<string, number> = {};
    recentEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const distributionData = Object.entries(moodCounts).map(([mood, count]) => {
      const moodOption = getMoodOption(mood as MoodType);
      return {
        mood: moodOption.label,
        count,
        emoji: moodOption.emoji,
        color: getChartColor(mood as MoodType)
      };
    });

    // Weekly patterns
    const weeklyData: Record<string, number> = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    
    recentEntries.forEach(entry => {
      const dayName = new Date(entry.timestamp!).toLocaleDateString('en-US', { weekday: 'short' });
      if (entry.sentiment) {
        weeklyData[dayName] += entry.sentiment;
      }
    });

    const weeklyPatterns = Object.entries(weeklyData).map(([day, total]) => ({
      day,
      avgSentiment: Number((total / Math.max(1, recentEntries.length / 7)).toFixed(1))
    }));

    return {
      trendData,
      distributionData,
      weeklyPatterns,
      totalEntries: recentEntries.length
    };
  }, [moodEntries, timeframe]);

  if (chartData.totalEntries === 0) {
    return (
      <Card className="glass-effect border-border/30">
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No Data Yet</h3>
          <p className="text-muted-foreground">
            Start logging your moods to see beautiful visualizations of your emotional patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <TrendingUp className="text-primary mr-3 h-6 w-6" />
          Mood Analytics
        </h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[140px] bg-background/50 border-border/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Mood Trend Chart */}
        <Card className="glass-effect border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Mood Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-primary">
                              Happiness Score: {payload[0].value}/5
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="hsl(247, 85%, 61%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(247, 85%, 61%)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(247, 85%, 61%)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution Pie Chart */}
        <Card className="glass-effect border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.distributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ mood, count }) => `${mood} (${count})`}
                    labelLine={false}
                  >
                    {chartData.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium flex items-center">
                              <span className="mr-2">{data.emoji}</span>
                              {data.mood}
                            </p>
                            <p className="text-primary">
                              Count: {data.count} entries
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Patterns Bar Chart */}
      <Card className="glass-effect border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Mood Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 5]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-primary">
                            Avg Happiness: {payload[0].value}/5
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="avgSentiment" 
                  fill="hsl(247, 85%, 61%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Get chart color for mood type
 */
function getChartColor(mood: MoodType): string {
  const colors = {
    happy: "#10b981",      // green
    sad: "#3b82f6",        // blue  
    angry: "#ef4444",      // red
    anxious: "#f97316",    // orange
    excited: "#ec4899",    // pink
    neutral: "#f59e0b"     // yellow
  };
  
  return colors[mood] || colors.neutral;
}