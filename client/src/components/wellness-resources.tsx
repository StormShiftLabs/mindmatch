import { Heart, PlayCircle, Book, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Wellness resources component with guided activities
 */
export function WellnessResources() {
  const resources = [
    {
      title: "5-Minute Meditation",
      description: "Quick stress relief",
      icon: PlayCircle,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      action: "Start Session"
    },
    {
      title: "Breathing Exercises", 
      description: "Calm your mind",
      icon: Headphones,
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      action: "Begin Practice"
    },
    {
      title: "Journal Prompts",
      description: "Reflect deeper",
      icon: Book,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30", 
      action: "View Prompts"
    }
  ];

  return (
    <Card className="glass-effect border-border/30">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Heart className="text-primary mr-3 h-5 w-5" />
          Wellness Resources
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div
              key={resource.title}
              className="p-3 hover:bg-background/30 rounded-lg transition-colors group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resource.color}`}>
                  <resource.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  {resource.action}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <h4 className="font-medium text-primary mb-2">Daily Wellness Tip</h4>
          <p className="text-sm text-muted-foreground">
            Take three deep breaths before checking your phone in the morning. This simple practice helps center your mind for the day ahead.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
