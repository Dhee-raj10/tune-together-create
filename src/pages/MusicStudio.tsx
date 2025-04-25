
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: 'solo' | 'collaboration' | 'learning';
}

// Function to validate if a string is a valid project mode
const isValidProjectMode = (mode: string): mode is 'solo' | 'collaboration' | 'learning' => {
  return ['solo', 'collaboration', 'learning'].includes(mode);
};

const MusicStudio = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        
        if (data) {
          // Validate mode before setting state
          const mode = isValidProjectMode(data.mode) ? data.mode : 'solo';
          
          setProject({
            ...data,
            mode
          });
        } else {
          console.error("Project data not found");
          setProject(null);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!projectId) return;
    
    setIsDeleting(true);
    try {
      // 1. Delete the project from the database
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast.success("Project deleted successfully");
      // 2. Redirect to the dashboard
      navigate('/');
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading studio...</div>;
  }

  if (!project) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Button asChild>
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">{project.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {project.mode} mode
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Project
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      project and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProject}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Basic Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Virtual Instruments Panel */}
            <div className="lg:col-span-3 border rounded-lg p-4 bg-card">
              <h2 className="font-bold mb-4">Instruments</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  🥁 Drum Machine
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎹 Piano
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎸 Guitar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎺 Synth
                </Button>
              </div>
            </div>

            {/* Track Arrangement */}
            <div className="lg:col-span-6 border rounded-lg p-4 bg-card min-h-[400px]">
              <h2 className="font-bold mb-4">Tracks</h2>
              <div className="bg-muted/50 rounded-lg p-2 h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Track arrangement area</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <Button variant="outline" size="sm">
                    Add Track
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    ▶️ Play
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏹️ Stop
                  </Button>
                  <Button variant="outline" size="sm">
                    🔄 Loop
                  </Button>
                </div>
              </div>
            </div>

            {/* Mixer and Controls */}
            <div className="lg:col-span-3 border rounded-lg p-4 bg-card">
              <h2 className="font-bold mb-4">Mixer</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Master Volume</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="80"
                    className="w-full" 
                  />
                </div>
                <div>
                  <label className="text-sm">Tempo (BPM)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="60" 
                      max="200"
                      defaultValue="120"
                      className="w-full p-2 text-sm border rounded" 
                    />
                  </div>
                </div>
                <Button className="w-full mt-4 bg-music-400 hover:bg-music-500">
                  Save Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MusicStudio;
