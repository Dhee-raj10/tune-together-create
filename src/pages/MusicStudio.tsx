
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { StudioLayout } from "@/components/studio/StudioLayout";
import { InstrumentsPanel } from "@/components/studio/InstrumentsPanel";
import { TrackArrangementPanel } from "@/components/studio/TrackArrangementPanel";
import { MixerPanel } from "@/components/studio/MixerPanel";
import { TrackList } from "@/components/TrackList";
import { CollaborationRequests } from "@/components/studio/CollaborationRequests";
import { TrackUploader } from "@/components/TrackUploader";
import { AISuggestionPanel } from "@/components/AISuggestionPanel";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: 'solo' | 'collaboration' | 'learning';
  master_volume: number | null;
  tempo: number | null;
  updated_at: string;
}

interface Track {
  id: string;
  title: string;
  file_url: string;
  user_id: string;
  project_id: string;
  created_at: string;
  duration?: number;
}

const isValidProjectMode = (mode: string): mode is 'solo' | 'collaboration' | 'learning' => {
  return ['solo', 'collaboration', 'learning'].includes(mode);
};

const MusicStudio = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*, master_volume, tempo, updated_at')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        
        if (data) {
          const mode = isValidProjectMode(data.mode) ? data.mode : 'solo';
          setProject({
            ...data,
            mode,
            master_volume: data.master_volume,
            tempo: data.tempo,
            updated_at: data.updated_at,
          });
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        toast.error("Failed to load project details.");
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTracks = async () => {
      if (!projectId) return;
      
      setTracksLoading(true);
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setTracks(data || []);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setTracksLoading(false);
      }
    };

    fetchProject();
    fetchTracks();
    
    // Set up realtime subscription for tracks
    if (projectId) {
      const channel = supabase
        .channel('studio-changes')
        .on(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tracks',
            filter: `project_id=eq.${projectId}`
          },
          () => {
            fetchTracks();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!projectId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast.success("Project deleted successfully");
      navigate('/');
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTrackUploadComplete = (trackData: any) => {
    setShowUploader(false);
    setTracks(prevTracks => [trackData, ...prevTracks]);
    toast.success("Track uploaded and added to your project");
  };

  const handleAISuggestionAccepted = () => {
    // No need to manually refresh tracks anymore as we're using realtime subscriptions
    toast.success("AI suggestion integrated into your project");
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading studio...</div>;
  }

  if (!project) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <p>The project you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }

  // Check if this project has tracks
  const hasTracks = tracks.length > 0;

  return (
    <StudioLayout 
      title={project.title}
      mode={project.mode}
      onDelete={handleDeleteProject}
      isDeleting={isDeleting}
    >
      {user && project.mode === 'collaboration' && <CollaborationRequests />}
      
      {/* Track Upload Button */}
      {user && (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setShowUploader(!showUploader)}
            className="bg-music-400 hover:bg-music-500 flex items-center gap-2"
          >
            <Plus size={16} /> {showUploader ? "Hide Uploader" : "Upload New Track"}
          </Button>
        </div>
      )}
      
      {/* Track Uploader */}
      {showUploader && projectId && user && (
        <div className="mb-6">
          <TrackUploader 
            projectId={projectId} 
            onUploadComplete={handleTrackUploadComplete} 
          />
        </div>
      )}
      
      {/* AI Suggestion Panel - Show only after tracks are available */}
      {user && projectId && hasTracks && (
        <div className="mb-6">
          <AISuggestionPanel 
            projectId={projectId}
            onSuggestionAccepted={handleAISuggestionAccepted}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <InstrumentsPanel />
        <TrackArrangementPanel projectId={projectId} />
        <MixerPanel 
          projectId={project.id}
          initialMasterVolume={project.master_volume}
          initialTempo={project.tempo}
        />
      </div>
      
      {user && (
        <div className="mt-8">
          <TrackList 
            projectId={project.id}
            userId={user.id}
          />
        </div>
      )}
      
      {/* Show guidance message if no tracks */}
      {!hasTracks && !showUploader && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-6">
          <p className="text-center text-amber-800">
            Your project doesn't have any tracks yet. Upload your first track to get started!
          </p>
        </div>
      )}
    </StudioLayout>
  );
};

export default MusicStudio;
