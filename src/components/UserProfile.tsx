
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

export const UserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Not authenticated');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError('Profile not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center p-4">Profile not found</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
        <AvatarFallback>
          {profile.full_name?.split(' ').map(n => n[0]).join('') || '?'}
        </AvatarFallback>
      </Avatar>
      <h1 className="text-2xl font-bold">{profile.full_name}</h1>
      {profile.username && (
        <p className="text-muted-foreground">@{profile.username}</p>
      )}
    </div>
  );
};
