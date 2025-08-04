import { useQuery } from "@tanstack/react-query";
import { BarChart3, Calendar, Flame, Smile, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Analytics {
  totalEntries: number;
  happinessScore: number;
  streak: number;
  aiInsights: number;
}

/**
 * Analytics dashboard component showing key metrics
 */
export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const metrics = [
    {
      title: "Total Entries",
      value: analytics?.totalEntries || 0,
      icon: Calendar,
      color: "bg-primary/20 text-primary border-primary/30",
      suffix: "",
      description: "+12% from last month"
    },
    {
      title: "Happiness Score", 
      value: analytics?.happinessScore || 0,
      icon: Smile,
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      suffix: "/10",
      description: "Above average"
    },
    {
      title: "Current Streak",
      value: analytics?.streak || 0,
      icon: Flame,
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30", 
      suffix: " days",
      description: analytics?.streak && analytics.streak > 0 ? "Keep it up!" : "Start tracking"
    },
    {
      title: "AI Insights",
      value: analytics?.aiInsights || 0,
      icon: Sparkles,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      suffix: "",
      description: "This month"
    }
  ];

  if (isLoading) {
    return (
      <Card className="glass-effect border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <BarChart3 className="text-primary mr-3 h-6 w-6" />
            Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-muted rounded-lg"></div>
                  <div className="w-6 h-6 bg-muted rounded"></div>
                </div>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
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
        <CardTitle className="text-2xl font-bold flex items-center">
          <BarChart3 className="text-primary mr-3 h-6 w-6" />
          Analytics Overview
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              className={`p-4 rounded-xl border transition-colors hover:bg-background/30 animate-fade-in ${metric.color}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">
                    {metric.value}{metric.suffix}
                  </p>
                </div>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                {metric.title === "Current Streak" && metric.value > 7 && (
                  <Badge variant="secondary" className="text-xs">
                    🔥 Hot streak!
                  </Badge>
                )}
                {metric.title === "Happiness Score" && metric.value >= 7 && (
                  <Badge variant="secondary" className="text-xs">
                    😊 Great mood!
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for future chart */}
        <div className="mt-8 p-6 bg-background/30 border border-border/30 rounded-xl text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-muted-foreground mb-2">Mood Trends Chart</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Visual representation of your emotional journey over time
          </p>
          <Badge variant="outline" className="text-xs">
            Coming Soon
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
