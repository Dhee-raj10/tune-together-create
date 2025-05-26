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
import type { Tables } from "@/integrations/supabase/types"; // Import Tables type

interface Project extends Tables<'projects'> { // Use Tables<'projects'> for strong typing
  // id, title, description, mode, master_volume, tempo, updated_at are from Tables<'projects'>
  // owner_id is also part of Tables<'projects'>
}

interface Track extends Tables<'tracks'> {
  // id, title, file_url, user_id, project_id, created_at, duration are from Tables<'tracks'>
}

interface ProjectExitRequest extends Tables<'project_exit_requests'> {}

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
  const [exitRequestStatus, setExitRequestStatus] = useState<ProjectExitRequest['status'] | null>(null);
  const [isRequestingExit, setIsRequestingExit] = useState(false);

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
          .select('*') // Select all columns, including owner_id
          .eq('id', projectId)
          .single();

        if (error) throw error;
        
        if (data) {
          const mode = isValidProjectMode(data.mode) ? data.mode : 'solo';
          setProject({
            ...data,
            mode,
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
        console.error('Error fetching tracks in MusicStudio:', error); // Differentiate log
      } finally {
        setTracksLoading(false);
      }
    };

    fetchProject();
    fetchTracks(); 
    
    let projectExitRequestChannel: any;
    if (projectId && user) {
      // Check for existing pending exit requests for this user and project
      const checkExistingExitRequest = async () => {
        const { data, error } = await supabase
          .from('project_exit_requests')
          .select('status')
          .eq('project_id', projectId)
          .eq('requester_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (error) {
          console.error("Error checking existing exit request:", error);
        } else if (data) {
          setExitRequestStatus(data.status as ProjectExitRequest['status']);
        }
      };
      checkExistingExitRequest();

      // Realtime listener for tracks (existing)
      const tracksChannel = supabase
        .channel(`music-studio-tracks-changes-${projectId}`)
        .on(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tracks',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            console.log('Track change received in MusicStudio!', payload);
            fetchTracks();
          }
        )
        .subscribe();
      
      // Realtime listener for project_exit_requests
      projectExitRequestChannel = supabase
        .channel(`project-exit-requests-changes-${projectId}-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_exit_requests',
            filter: `project_id=eq.${projectId},requester_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Project exit request change received!', payload);
            const updatedRequest = payload.new as ProjectExitRequest;
            if (updatedRequest) {
              setExitRequestStatus(updatedRequest.status);
              if (updatedRequest.status === 'approved') {
                toast.success("Exit request approved! You can now leave the project.");
                // Optionally navigate away or enable a "Leave Now" button
                // For now, just notify. User can click "Save & Exit" again.
                // Or directly navigate: navigate('/');
              } else if (updatedRequest.status === 'rejected') {
                toast.error("Exit request rejected by the project owner.");
              }
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(tracksChannel);
        if (projectExitRequestChannel) {
          supabase.removeChannel(projectExitRequestChannel);
        }
      };
    }
  }, [projectId, user]); // Added user to dependency array

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
    // setTracks(prevTracks => [trackData, ...prevTracks]); // This is handled by realtime now
    toast.success("Track uploaded and added to your project");
  };

  const handleAISuggestionAccepted = () => {
    toast.success("AI suggestion integrated into your project");
  };

  const handleRequestSaveAndExit = async () => {
    if (!project || !user) {
      toast.error("Project or user data not available.");
      return;
    }

    // If user is the owner or project mode is solo/learning, exit immediately
    if (project.owner_id === user.id || project.mode === 'solo' || project.mode === 'learning') {
      navigate('/');
      return;
    }
    
    // If it's a collaboration and user is not the owner
    if (project.mode === 'collaboration' && project.owner_id !== user.id) {
      // Check if already approved
      if (exitRequestStatus === 'approved') {
        toast.info("Your previous exit request was approved. Exiting now.");
        navigate('/');
        return;
      }
      // Check if already pending
      if (exitRequestStatus === 'pending') {
        toast.info("You already have a pending exit request for this project.");
        return;
      }

      setIsRequestingExit(true);
      try {
        const { error } = await supabase
          .from('project_exit_requests')
          .insert({
            project_id: project.id,
            requester_id: user.id,
            approver_id: project.owner_id, // Project owner needs to approve
            status: 'pending',
          });

        if (error) throw error;

        setExitRequestStatus('pending');
        toast.success("Save & Exit request sent to the project owner. You will be notified upon approval.");
      } catch (err) {
        console.error("Error requesting save and exit:", err);
        toast.error("Failed to send Save & Exit request.");
      } finally {
        setIsRequestingExit(false);
      }
    }
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

  const hasTracks = tracks.length > 0;

  return (
    <StudioLayout 
      title={project?.title || "Loading Project..."}
      mode={project?.mode || 'solo'}
      onDelete={handleDeleteProject}
      isDeleting={isDeleting}
      onRequestSaveAndExit={handleRequestSaveAndExit}
      isRequestingExit={isRequestingExit || exitRequestStatus === 'pending'}
      canExitImmediately={project?.owner_id === user?.id || project?.mode === 'solo' || project?.mode === 'learning' || exitRequestStatus === 'approved'}
    >
      {user && project?.mode === 'collaboration' && <CollaborationRequests />}
      
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
      
      {showUploader && projectId && user && (
        <div className="mb-6 upload-track">
          <TrackUploader 
            projectId={projectId} 
            onUploadComplete={handleTrackUploadComplete} 
          />
        </div>
      )}
      
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
      
      {user && project && (
        <div className="mt-8">
          <TrackList 
            projectId={project.id}
            userId={user.id}
          />
        </div>
      )}
      
      {!tracksLoading && !hasTracks && !showUploader && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-6">
          <p className="text-center text-amber-800">
            Your project doesn't have any tracks yet. Use the "Upload New Track" button above to add your first track and get started!
          </p>
        </div>
      )}
    </StudioLayout>
  );
};

export default MusicStudio;
