
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

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
    return <div className="flex items-center justify-center p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center p-4 text-red-500">Profile not set up yet.</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center p-4">Profile not found</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
      </CardContent>
    </Card>
  );
};
