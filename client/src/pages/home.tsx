import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Quote, BarChart3, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { MoodLogger } from "@/components/mood-logger";
import { MoodHistory } from "@/components/mood-history";
import { AIInsights } from "@/components/ai-insights";
import { WeeklySummary } from "@/components/weekly-summary";
import { WellnessResources } from "@/components/wellness-resources";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { MoodCharts } from "@/components/mood-charts";
import { useAuth } from "@/components/auth-fallback";
import { apiRequest } from "@/lib/queryClient";
import type { MotivationalQuote } from "@shared/schema";

/**
 * Main home page component - MindMatch dashboard
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState("journal");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch daily quote
  const { data: quote, isLoading: quoteLoading } = useQuery<MotivationalQuote>({
    queryKey: ["/api/quotes/random"],
  });

  // Generate new quote mutation
  const newQuoteMutation = useMutation({
    mutationFn: async (): Promise<MotivationalQuote> => {
      const res = await apiRequest("GET", "/api/quotes/random");
      return res.json();
    },
    onSuccess: (newQuote) => {
      // Update the cached query so UI reflects the new quote immediately
      queryClient.setQueryData(["/api/quotes/random"], newQuote);
      toast({
        title: "New quote generated",
        description: "Here's a fresh motivational quote for you!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to get new quote",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <section className="mb-12 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getGreeting()}, <span className="text-gradient">
                {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || "there"}
              </span> 👋
            </h2>
            <p className="text-muted-foreground text-lg">
              How are you feeling today? Let's track your emotional journey.
            </p>
          </div>

          {/* Daily Motivational Quote */}
          <Card className="glass-effect border-border/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
            <CardContent className="relative p-6 text-center">
              <Quote className="text-primary text-2xl mx-auto mb-4" />
              
              {quoteLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto animate-pulse"></div>
                </div>
              ) : (
                <>
                  <blockquote className="text-xl md:text-2xl font-medium mb-4 leading-relaxed">
                    "{quote?.text || "The best way to take care of the future is to take care of the present moment."}"
                  </blockquote>
                  <cite className="text-muted-foreground">
                    — {quote?.author || "Thich Nhat Hanh"}
                  </cite>
                  
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => newQuoteMutation.mutate()}
                      disabled={newQuoteMutation.isPending}
                      className="bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      {newQuoteMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          🔁 Show Another Quote
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 h-12 bg-background/50 border border-border/30 rounded-xl p-1">
            <TabsTrigger 
              value="journal" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wellness" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              <Quote className="w-4 h-4" />
              <span className="hidden sm:inline">Wellness</span>
            </TabsTrigger>
          </TabsList>

          {/* Journal Tab - Mood Logging & History */}
          <TabsContent value="journal" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column - Mood Logging & History */}
              <div className="lg:col-span-2 space-y-8">
                <div className="animate-slide-up">
                  <MoodLogger />
                </div>
                
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <MoodHistory />
                </div>
              </div>

              {/* Right Column - Quick Insights */}
              <div className="space-y-8">
                <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <WeeklySummary />
                </div>
                
                <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <AIInsights />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab - Charts & Trends */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="animate-fade-in">
              <MoodCharts />
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <AnalyticsDashboard />
            </div>
          </TabsContent>

          {/* Insights Tab - AI Analysis */}
          <TabsContent value="insights" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="animate-slide-up">
                <AIInsights />
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <WeeklySummary />
              </div>
            </div>
          </TabsContent>

          {/* Wellness Tab - Resources & Tips */}
          <TabsContent value="wellness" className="space-y-8">
            <div className="animate-fade-in">
              <WellnessResources />
            </div>
          </TabsContent>

        </Tabs>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="mood-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🧘‍♀️</span>
                </div>
                <span className="font-bold text-gradient">MindMatch</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered emotional wellness tracking to help you understand and improve your mental health.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Mood Logging</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">AI Insights</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Export Data</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 bg-secondary hover:bg-primary rounded-lg flex items-center justify-center transition-colors" aria-label="Twitter">
                  <span className="text-sm">𝕏</span>
                </a>
                <a href="#" className="w-8 h-8 bg-secondary hover:bg-primary rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                  <span className="text-sm">📷</span>
                </a>
                <a href="#" className="w-8 h-8 bg-secondary hover:bg-primary rounded-lg flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <span className="text-sm">💼</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 MindMatch. All rights reserved. Made with ❤️ for mental wellness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
