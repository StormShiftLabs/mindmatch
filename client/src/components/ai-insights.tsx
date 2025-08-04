import { useQuery } from "@tanstack/react-query";
import { Brain, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AIInsight } from "@shared/schema";

/**
 * AI insights component displaying pattern analysis and suggestions
 */
export function AIInsights() {
  const { data: insights = [], isLoading } = useQuery<AIInsight[]>({
    queryKey: ["/api/insights"],
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return TrendingUp;
      case "trend": 
        return TrendingUp;
      case "warning":
        return AlertTriangle;
      default:
        return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "trend":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "warning":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-border/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Brain className="text-primary mr-3 h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-border/30">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Brain className="text-primary mr-3 h-5 w-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No insights yet</h3>
            <p className="text-sm text-muted-foreground">
              Keep logging your moods to receive personalized AI insights and pattern analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.type);
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-colors hover:bg-background/30 animate-fade-in ${colorClass}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass.split(' ')[0]}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium capitalize">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          {insight.confidence && (
                            <Badge variant="secondary" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          )}
                          {insight.actionable && (
                            <Badge variant="outline" className="text-xs">
                              Actionable
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
