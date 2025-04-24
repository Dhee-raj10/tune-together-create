
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: 'solo' | 'collaboration' | 'learning';
}

export const ProfileList = () => {
  const [profiles, setProfiles] = useState<(Profile & { projects?: Project[] })[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        // Get all profiles except current user
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) throw profilesError;

        // Filter out current user and prepare profiles
        const filteredProfiles = user 
          ? profilesData.filter(profile => profile.id !== user.id)
          : profilesData;

        // Get projects for each profile
        const profilesWithProjects = await Promise.all(
          filteredProfiles.map(async (profile) => {
            const { data: projectsData } = await supabase
              .from('projects')
              .select('*')
              .eq('owner_id', profile.id)
              .limit(3); // Limit to the most recent 3 projects

            return {
              ...profile,
              projects: projectsData || []
            };
          })
        );

        setProfiles(profilesWithProjects);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleCollaborate = (profileId: string) => {
    // Navigate to collaboration setup
    navigate(`/create/collaborate?collaborator=${profileId}`);
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading profiles...</div>;
  }

  if (profiles.length === 0) {
    return <div className="text-center p-6">No other users found</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <Card key={profile.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarImage src={profile.avatar_url || ''} alt={profile.username || ''} />
              <AvatarFallback>
                {profile.username?.charAt(0).toUpperCase() || (profile.full_name?.split(' ').map(n => n[0]).join('')) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.username || 'Anonymous'}</CardTitle>
              {profile.full_name && <CardDescription>{profile.full_name}</CardDescription>}
            </div>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium mb-2">Recent Projects</h4>
            {profile.projects && profile.projects.length > 0 ? (
              <ul className="space-y-2">
                {profile.projects.map((project) => (
                  <li key={project.id} className="text-sm">
                    <strong>{project.title}</strong>
                    {project.description && <p className="text-muted-foreground text-xs truncate">{project.description}</p>}
                    <div className="text-xs text-muted-foreground mt-1">Mode: {project.mode}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No projects yet</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleCollaborate(profile.id)} 
              className="w-full bg-music-400 hover:bg-music-500"
            >
              Collaborate
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
