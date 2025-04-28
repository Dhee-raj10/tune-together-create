
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Stop, Repeat, Music, Plus } from "lucide-react";
import { toast } from "sonner";

export const TrackArrangementPanel = () => {
  const { projectId } = useParams();
  const [tracks, setTracks] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!projectId) return;
    
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
    
    fetchTracks();
    
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

  // Audio context and nodes for the web audio API
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioNodes, setAudioNodes] = useState<{[key: string]: {source: AudioBufferSourceNode, gainNode: GainNode}}>({}); 

  // Initialize audio context on first interaction
  const initAudio = () => {
    if (!audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
      return context;
    }
    return audioContext;
  };

  const handlePlay = async () => {
    const context = initAudio();
    
    if (tracks.length === 0) {
      toast.warning("No tracks available to play");
      return;
    }
    
    try {
      setLoading(true);
      
      // Stop any currently playing audio
      stopAllAudio();
      
      // Load and play all tracks
      for (const track of tracks) {
        if (!track.file_url) continue;
        
        const response = await fetch(track.file_url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        
        const gainNode = context.createGain();
        gainNode.gain.value = 0.8; // Default volume
        
        source.connect(gainNode);
        gainNode.connect(context.destination);
        
        source.loop = isLooping;
        source.start(0);
        
        // Store references to audio nodes
        setAudioNodes(prev => ({
          ...prev,
          [track.id]: { source, gainNode }
        }));
      }
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing tracks:', error);
      toast.error('Failed to play tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    stopAllAudio();
    setIsPlaying(false);
  };

  const stopAllAudio = () => {
    // Stop all currently playing sources
    Object.values(audioNodes).forEach(({ source }) => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    
    // Clear audio nodes
    setAudioNodes({});
  };

  const toggleLoop = () => {
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);
    
    // Update loop setting for currently playing sources
    Object.values(audioNodes).forEach(({ source }) => {
      source.loop = newLoopState;
    });
  };

  return (
    <div className="lg:col-span-6 border rounded-lg p-4 bg-card min-h-[400px]">
      <h2 className="font-bold mb-4">Tracks</h2>
      <div className="bg-muted/50 rounded-lg p-2 h-[300px] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading tracks...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Music className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mt-2">No tracks yet</p>
              <p className="text-xs text-muted-foreground">Upload tracks to see them here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 overflow-auto h-full">
            {tracks.map((track) => (
              <div 
                key={track.id}
                className="bg-white p-2 rounded flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Music className="h-4 w-4 mr-2 text-music-400" />
                  <span className="text-sm">{track.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Plus size={14} />
          Add Track
        </Button>
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStop}
              className="flex items-center gap-1"
            >
              <Stop size={14} />
              Stop
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePlay}
              className="flex items-center gap-1"
              disabled={loading || tracks.length === 0}
            >
              <Play size={14} />
              Play
            </Button>
          )}
          <Button 
            variant={isLooping ? "secondary" : "outline"} 
            size="sm" 
            onClick={toggleLoop}
            className="flex items-center gap-1"
          >
            <Repeat size={14} />
            Loop
          </Button>
        </div>
      </div>
    </div>
  );
};
