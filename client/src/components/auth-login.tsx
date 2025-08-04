import { useState } from "react";
import { Brain, Chrome, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

/**
 * Authentication login component with Google OAuth
 */
export function AuthLogin() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome to MindMatch!",
        description: "You're now logged in and ready to track your emotional wellness.",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "There was an issue signing in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* App Branding */}
        <div className="text-center space-y-4">
          <div className="mood-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
            <Brain className="text-white w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gradient">MindMatch</h1>
            <p className="text-muted-foreground text-lg mt-2">
              AI-Powered Emotional Wellness
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="glass-effect border-border/30">
          <CardHeader className="text-center space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">
                Sign in to continue your wellness journey
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-black border border-gray-300 h-12 text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-3" />
                  Signing in...
                </>
              ) : (
                <>
                  <Chrome className="w-5 h-5 mr-3 text-blue-500" />
                  Continue with Google
                </>
              )}
            </Button>

            {/* Features Preview */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <h3 className="font-medium text-center text-muted-foreground">
                What you'll get:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>AI-powered mood analysis and insights</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Brain className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>Personalized wellness recommendations</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Secure cloud storage for your data</span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
              <p>
                Your emotional data is encrypted and never shared with third parties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Benefits */}
        <div className="text-center space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-sm">📊</span>
              </div>
              <p className="text-muted-foreground">Track Patterns</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-sm">🎯</span>
              </div>
              <p className="text-muted-foreground">Get Insights</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-sm">🌱</span>
              </div>
              <p className="text-muted-foreground">Grow Daily</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}