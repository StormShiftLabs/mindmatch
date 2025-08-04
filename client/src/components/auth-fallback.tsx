import { createContext, useContext, useState } from "react";

/**
 * Fallback authentication context when Firebase isn't configured
 */
interface AuthFallbackContextType {
  user: { 
    displayName: string; 
    email: string; 
    photoURL?: string;
  } | null;
  loading: boolean;
}

const AuthFallbackContext = createContext<AuthFallbackContextType | null>(null);

/**
 * Custom hook for fallback auth
 */
export function useAuth() {
  const context = useContext(AuthFallbackContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthFallbackProvider');
  }
  return context;
}

/**
 * Fallback authentication provider - simulates a logged-in user
 */
export function AuthFallbackProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState({
    displayName: "Demo User",
    email: "demo@mindmatch.app",
    photoURL: undefined
  });
  const [loading] = useState(false);

  const value: AuthFallbackContextType = {
    user,
    loading,
  };

  return (
    <AuthFallbackContext.Provider value={value}>
      {children}
    </AuthFallbackContext.Provider>
  );
}