
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MusicianRoleSelector } from './MusicianRoleSelector';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  roles?: string[];
}

interface UserProfileProps {
  userId?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);

  // Use the provided userId or fall back to the current logged-in user
  const profileId = userId || user?.id;
  const isOwnProfile = !userId || (user && userId === user.id);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (error) throw error;
        setProfile(data);
        
        // Open role selector if this is the user's own profile and no roles are set
        if (isOwnProfile && (!data.roles || data.roles.length === 0)) {
          setIsRoleSelectorOpen(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Profile not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, isOwnProfile]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center p-4 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center p-4">Profile not found</div>;
  }

  return (
    <>
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username || ''} />
            <AvatarFallback>
              {profile.username?.charAt(0).toUpperCase() || (profile.full_name?.split(' ').map(n => n[0]).join('')) || '?'}
            </AvatarFallback>
          </Avatar>
          {profile.username && (
            <h1 className="text-2xl font-bold">{profile.username}</h1>
          )}
          {profile.full_name && (
            <p className="text-muted-foreground">{profile.full_name}</p>
          )}
          {profile.roles && profile.roles.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {profile.roles.map(role => (
                <span 
                  key={role} 
                  className="bg-music-100 text-music-800 px-2 py-1 rounded-full text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
          )}
          
          {isOwnProfile && profile.roles && profile.roles.length === 0 && (
            <button 
              onClick={() => setIsRoleSelectorOpen(true)}
              className="text-sm text-music-500 hover:underline mt-2"
            >
              Set your musician roles
            </button>
          )}
        </CardContent>
      </Card>

      {profile && isOwnProfile && (
        <MusicianRoleSelector 
          isOpen={isRoleSelectorOpen}
          onClose={() => setIsRoleSelectorOpen(false)}
          userId={profile.id}
        />
      )}
    </>
  );
};
