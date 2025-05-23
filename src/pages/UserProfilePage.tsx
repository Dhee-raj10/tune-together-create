
import { useState, useEffect } from 'react';
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
  
  // If no userId is provided, use the current logged-in user's ID
  const profileUserId = userId || user?.id;
  
  // Check if viewing own profile
  const isOwnProfile = !userId || (user && userId === user.id);

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!profileUserId) return;

      setIsLoading(true);
      
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (isOwnProfile) {
          // If viewing own profile, show all projects owned by the user
          query = query.eq('owner_id', profileUserId);
        } else {
          // If viewing someone else's profile, only show their public or collaborative projects
          query = query
            .eq('owner_id', profileUserId)
            .neq('mode', 'solo');
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          // Validate and transform mode to ensure it matches the expected type
          const typedProjects: Project[] = data.map(project => ({
            ...project,
            mode: validateProjectMode(project.mode)
          }));
          
          setProjects(typedProjects);
        }
      } catch (err) {
        console.error('Error fetching user projects:', err);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProjects();
  }, [profileUserId, isOwnProfile]);

  // Helper function to validate project mode
  const validateProjectMode = (mode: string): 'solo' | 'collaboration' | 'learning' => {
    if (mode === 'solo' || mode === 'collaboration' || mode === 'learning') {
      return mode;
    }
    // Default to 'solo' if the mode is invalid
    return 'solo';
  };

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
    toast.error('Please log in to view profile');
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
            {isOwnProfile && (
              <Card>
                <CardContent className="pt-6">
                  <CollaborationRequests />
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
                {isOwnProfile ? 'My Projects' : 'Projects'}
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
                    ? "You haven't created any projects yet."
                    : "This user has no public projects."}
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
                          {new Date(project.created_at).toLocaleDateString()}
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
