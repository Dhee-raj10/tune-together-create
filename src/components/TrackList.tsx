
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TrackPlayer } from './TrackPlayer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  file_url: string;
  user_id: string;
  project_id: string;
  created_at: string;
  duration?: number;
}

interface TrackListProps {
  projectId: string;
  userId: string;
}

export const TrackList = ({ projectId, userId }: TrackListProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadButton, setShowUploadButton] = useState(false);
  
  const fetchTracks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTracks(data || []);
      
      // Only show upload button if we have no tracks
      setShowUploadButton(data?.length === 0);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (projectId) {
      fetchTracks();
    }
    
    // Set up realtime subscription
    const channel = supabase
      .channel('tracks-changes')
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
  }, [projectId]);
  
  const scrollToUploader = () => {
    // Find the upload section and scroll to it
    const uploadSection = document.querySelector('.upload-track');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If we can't find it, try to scroll to the top where the upload button should be
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tracks</h3>
        {showUploadButton && (
          <Button 
            onClick={scrollToUploader}
            className="bg-music-400 hover:bg-music-500 flex items-center gap-2"
            size="sm"
          >
            <Plus size={14} /> Upload Track
          </Button>
        )}
      </div>
      
      <div className="space-y-4 mt-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading tracks...</p>
        ) : tracks.length === 0 ? (
          <div className="text-center py-8 bg-muted/40 rounded-lg">
            <p className="text-muted-foreground text-sm mb-4">No tracks yet. Upload your first track!</p>
            <Button 
              onClick={scrollToUploader}
              className="bg-music-400 hover:bg-music-500 flex items-center gap-2"
              size="sm"
            >
              <Plus size={14} /> Upload Track
            </Button>
          </div>
        ) : (
          tracks.map(track => (
            <TrackPlayer 
              key={track.id}
              trackUrl={track.file_url}
              title={track.title}
              duration={track.duration}
            />
          ))
        )}
      </div>
    </div>
  );
};
