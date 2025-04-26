
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { MusicianRoleSelector } from "@/components/MusicianRoleSelector";

interface AuthContextType {
  user: User | null;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Check if we need to show the role selector when user logs in
        if (currentSession?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            checkUserRoles(currentSession.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check if we need to show the role selector for existing session
      if (currentSession?.user) {
        checkUserRoles(currentSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to check if user has roles set
  const checkUserRoles = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', userId)
        .single();
      
      // Show role selector if user has no roles set
      setShowRoleSelector(!profile?.roles || profile.roles.length === 0);
    } catch (error) {
      console.error("Error checking user roles:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session }}>
      {children}
      {user && showRoleSelector && (
        <MusicianRoleSelector
          isOpen={showRoleSelector}
          onClose={() => setShowRoleSelector(false)}
          userId={user.id}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
