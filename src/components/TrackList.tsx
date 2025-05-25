
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TrackPlayer } from './TrackPlayer';
// Button and Plus icon are no longer needed here directly for uploading
// import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react';

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
  userId: string; // userId might not be strictly necessary if all data is project-scoped and RLS handles user access
}

export const TrackList = ({ projectId }: TrackListProps) => { // Removed userId from props for now
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  // showUploadButton state is no longer needed
  
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
      // Logic for setShowUploadButton is removed
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
    
    const channel = supabase
      .channel(`tracks-changes-${projectId}`) // Ensure unique channel name per project
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tracks',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchTracks(); // Refetch tracks on any change
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
  
  // scrollToUploader function is removed as the button is gone

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tracks</h3>
        {/* Removed Upload Button from here */}
      </div>
      
      <div className="space-y-4 mt-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading tracks...</p>
        ) : tracks.length === 0 ? (
          <div className="text-center py-8 bg-muted/40 rounded-lg">
            <p className="text-muted-foreground text-sm mb-4">No tracks yet. Use the "Upload New Track" button above to add your first track!</p>
            {/* Removed Upload Button from here */}
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

