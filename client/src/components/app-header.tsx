import { Bell, Brain, History, Lightbulb, LogOut, Moon, Settings, Sun, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "./auth-fallback";
import { useToast } from "@/hooks/use-toast";

/**
 * App header component with navigation and theme toggle
 */
export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    toast({
      title: "Demo Mode Active",
      description: "Set up Firebase authentication to enable real user accounts and cloud sync.",
    });
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="mood-gradient w-10 h-10 rounded-xl flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">MindMatch</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Wellness</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation">
            <a href="#dashboard" className="text-primary font-medium hover:text-primary/80 transition-colors flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </a>
            <a href="#history" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <History className="w-4 h-4 mr-2" />
              History
            </a>
            <a href="#insights" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </a>
            <a href="#settings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-secondary/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/50 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
            </Button>

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 hover:bg-secondary/50 transition-colors">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-8 h-8 rounded-full border-2 border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur border-border/30">
                <div className="px-3 py-2 border-b border-border/30">
                  <p className="text-sm font-medium">{user?.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem className="hover:bg-secondary/50 cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary/50 cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/30" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="hover:bg-secondary/50 cursor-pointer text-red-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
