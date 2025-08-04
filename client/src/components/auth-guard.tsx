import { useAuth } from "./auth-provider";
import { AuthLogin } from "./auth-login";

/**
 * Authentication guard component that protects routes
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mood-gradient w-16 h-16 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white text-2xl">🧘‍♀️</span>
          </div>
          <h2 className="text-2xl font-bold text-gradient">MindMatch</h2>
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show login component if user is not authenticated
  if (!user) {
    return <AuthLogin />;
  }

  // Render protected content if user is authenticated
  return <>{children}</>;
}