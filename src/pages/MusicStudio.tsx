
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

interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: 'solo' | 'collaboration' | 'learning';
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
          const mode = isValidProjectMode(data.mode) ? data.mode : 'solo';
          setProject({
            ...data,
            mode
          });
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

  const handleTrackUploadComplete = () => {
    setShowUploader(false);
    toast.success("Track uploaded and added to your project");
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading studio...</div>;
  }

  if (!project) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
      </div>
    );
  }

  return (
    <StudioLayout 
      title={project.title}
      mode={project.mode}
      onDelete={handleDeleteProject}
      isDeleting={isDeleting}
    >
      {user && <CollaborationRequests />}
      
      {showUploader && projectId && (
        <div className="mb-6">
          <TrackUploader 
            projectId={projectId} 
            onUploadComplete={handleTrackUploadComplete} 
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <InstrumentsPanel />
        <TrackArrangementPanel />
        <MixerPanel />
      </div>
      
      {user && (
        <div className="mt-8">
          <TrackList 
            projectId={project.id}
            userId={user.id}
          />
        </div>
      )}
    </StudioLayout>
  );
};

export default MusicStudio;
