
import React, { useRef, useState } from 'react';
import { Play, Pause, Repeat } from 'lucide-react';
import { toast } from 'sonner';

interface TrackPlayerProps {
  trackUrl: string;
  title: string;
  duration?: number;
}

export const TrackPlayer: React.FC<TrackPlayerProps> = ({ 
  trackUrl, 
  title, 
  duration 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          toast.error(`Error playing track: ${error.message}`);
        });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
      <audio 
        ref={audioRef} 
        src={trackUrl} 
        onEnded={() => setIsPlaying(false)}
      />
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        {duration && (
          <p className="text-sm text-muted-foreground">
            {Math.floor(duration / 60)}:{(duration % 60).toFixed(0)} mins
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {isPlaying ? (
          <button 
            onClick={handlePause} 
            className="hover:bg-muted rounded-full p-2"
          >
            <Pause className="h-5 w-5" />
          </button>
        ) : (
          <button 
            onClick={handlePlay} 
            className="hover:bg-muted rounded-full p-2"
          >
            <Play className="h-5 w-5" />
          </button>
        )}
        <button 
          onClick={handleToggleLoop} 
          className={`hover:bg-muted rounded-full p-2 ${isLooping ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Repeat className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
