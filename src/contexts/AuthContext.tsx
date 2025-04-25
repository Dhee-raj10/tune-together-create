
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Check if we need to show the role selector
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('roles')
            .eq('id', session.user.id)
            .single();

          // Show role selector if user has no roles set
          setShowRoleSelector(!profile?.roles || profile.roles.length === 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
