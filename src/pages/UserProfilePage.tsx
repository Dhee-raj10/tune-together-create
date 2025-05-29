import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CollaborationRequests } from '@/components/studio/CollaborationRequests';
import { PlusIcon, Settings, Music, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: 'solo' | 'collaboration' | 'learning';
  created_at: string;
  owner_id?: string;
  updated_at?: string;
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId || (user && userId === user.id);

  // Helper function to validate project mode
  const validateProjectMode = (mode: string): 'solo' | 'collaboration' | 'learning' => {
    if (mode === 'solo' || mode === 'collaboration' || mode === 'learning') {
      return mode;
    }
    return 'solo';
  };

  const fetchUserProjects = useCallback(async () => {
    if (!profileUserId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      let allFetchedProjects: Project[] = [];

      // Fetch projects owned by the user
      const { data: ownedProjectsData, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', profileUserId);

      if (ownedError) throw ownedError;
      if (ownedProjectsData) {
        allFetchedProjects = allFetchedProjects.concat(
          ownedProjectsData.map(p => ({ ...p, mode: validateProjectMode(p.mode) }))
        );
      }

      // Fetch projects where the user is a collaborator
      const { data: collabProjectsData, error: collabError } = await supabase
        .from('project_collaborators')
        .select('projects(*)')
        .eq('user_id', profileUserId);

      if (collabError) throw collabError;

      if (collabProjectsData) {
        const collaboratorProjects = collabProjectsData
          .map(pc => pc.projects)
          .filter(p => p !== null)
          .map(p => ({ ...p, mode: validateProjectMode(p!.mode) } as Project));
        allFetchedProjects = allFetchedProjects.concat(collaboratorProjects);
      }
      
      // Deduplicate projects
      const uniqueProjects = Array.from(new Map(allFetchedProjects.map(p => [p.id, p])).values());
      
      // Filter projects based on profile view
      const finalProjects = uniqueProjects.filter(p => {
        if (isOwnProfile) return true;
        return p.mode !== 'solo';
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setProjects(finalProjects);

    } catch (err) {
      console.error('Error fetching user projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [profileUserId, isOwnProfile]);

  useEffect(() => {
    if (profileUserId) {
      fetchUserProjects();
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProjects]);

  const handleCollaborationAccepted = useCallback(() => {
    // Refresh the project list when a collaboration request is accepted
    fetchUserProjects();
  }, [fetchUserProjects]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  if (!user && !userId) {
    toast.error('Please log in to view profile or specify a user ID.');
    navigate('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Profile Section */}
          <div className="lg:col-span-4 space-y-6">
            <UserProfile userId={profileUserId} />
            
            {/* Show collaboration requests only for own profile */}
            {isOwnProfile && user && (
              <Card>
                <CardContent className="pt-6">
                  <CollaborationRequests onRequestAccepted={handleCollaborationAccepted} />
                </CardContent>
              </Card>
            )}
            
            {isOwnProfile && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/settings/profile')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/settings/roles')}
                  >
                    <Music className="mr-2 h-4 w-4" />
                    Update Musical Roles
                  </Button>
                  <Button
                    className="w-full justify-start text-red-500" 
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Projects Section */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {isOwnProfile ? 'My Projects' : `${profileUserId ? 'User' : ''} Projects`}
              </h2>
              
              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button asChild>
                    <Link to="/create/solo">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      New Project
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/create/collaborate">
                      <Users className="h-4 w-4 mr-1" />
                      Collaborate
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-muted/40 rounded-lg">
                <Music className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {isOwnProfile 
                    ? "You haven't created or collaborated on any projects yet."
                    : "This user has no public or collaborative projects."}
                </p>
                {isOwnProfile && (
                  <Button asChild className="mt-4 bg-music-400 hover:bg-music-500">
                    <Link to="/create/solo">Create Your First Project</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:bg-muted/20 transition-colors">
                    <Link to={`/studio/${project.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="truncate">{project.title}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded-full 
                            ${project.mode === 'solo' ? 'bg-blue-100 text-blue-800' : 
                              project.mode === 'collaboration' ? 'bg-purple-100 text-purple-800' : 
                              'bg-green-100 text-green-800'}`}>
                            {project.mode}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                          {project.updated_at && project.updated_at !== project.created_at && (
                            <span className="ml-2">| Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                          )}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#e5ddff_100%)]" />
    </div>
  );
};

export default UserProfilePage;
