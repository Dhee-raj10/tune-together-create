
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TrackPlayer } from './TrackPlayer';
import { TrackUploader } from './TrackUploader';

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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tracks</h3>
      </div>
      
      <TrackUploader 
        projectId={projectId}
        onUploadComplete={fetchTracks}
      />
      
      <div className="space-y-4 mt-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading tracks...</p>
        ) : tracks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tracks yet. Upload your first track!</p>
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
