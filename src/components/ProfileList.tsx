
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  roles?: string[] | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: 'solo' | 'collaboration' | 'learning';
}

interface ProfileListProps {
  selectedRoles?: string[];
}

// Function to validate if a string is a valid project mode
const isValidProjectMode = (mode: string): mode is 'solo' | 'collaboration' | 'learning' => {
  return ['solo', 'collaboration', 'learning'].includes(mode);
};

export const ProfileList: React.FC<ProfileListProps> = ({ selectedRoles = [] }) => {
  const [profiles, setProfiles] = useState<(Profile & { projects?: Project[] })[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { getProfilesByRoles } = useProjects();

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        // Get profiles based on selected roles
        const profilesData = await getProfilesByRoles(selectedRoles);

        // Get projects for each profile
        const profilesWithProjects = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: projectsData } = await supabase
              .from('projects')
              .select('*')
              .eq('owner_id', profile.id)
              .limit(3); // Limit to the most recent 3 projects

            // Map the projects with validated mode type
            const typedProjects = projectsData?.map(project => ({
              ...project,
              mode: isValidProjectMode(project.mode) ? project.mode : 'solo' // Default to 'solo' if invalid
            })) || [];

            return {
              ...profile,
              projects: typedProjects
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
  }, [selectedRoles]);

  const handleCollaborate = (profileId: string) => {
    // Navigate to collaboration setup
    navigate(`/create/collaborate?collaborator=${profileId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-music-400" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">No matching musicians found</h3>
        {selectedRoles.length > 0 && (
          <p className="text-muted-foreground">
            We couldn't find any musicians with the selected roles. 
            Try selecting different roles or check back later.
          </p>
        )}
      </div>
    );
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
            {profile.roles && profile.roles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.roles.map(role => (
                  <span 
                    key={role} 
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedRoles.includes(role) 
                        ? 'bg-music-100 text-music-800 font-medium' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
            
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
