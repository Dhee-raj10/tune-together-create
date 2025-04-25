
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TrackPlayerProps {
  trackUrl: string;
  title: string;
  duration?: number;
}

export const TrackPlayer = ({ trackUrl, title, duration }: TrackPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Format time in MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setTrackDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        if (!isLooping) {
          setIsPlaying(false);
        }
      });
      
      // Set loop attribute based on state
      audioRef.current.loop = isLooping;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isLooping]);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => {
        console.error("Playback failed:", e);
        toast.error("Playback failed. Please try again.");
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const stopPlayback = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  const toggleLoop = () => {
    if (!audioRef.current) return;
    audioRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  };
  
  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  return (
    <div className="border rounded-md p-4 bg-card">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium truncate mr-2">{title}</h4>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={stopPlayback}
            aria-label="Stop"
          >
            <Square size={16} />
          </Button>
          <Button 
            variant={isLooping ? "secondary" : "outline"} 
            size="icon" 
            className="h-8 w-8"
            onClick={toggleLoop}
            aria-label={isLooping ? "Loop enabled" : "Loop disabled"}
          >
            <Repeat size={16} />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Slider
          min={0}
          max={trackDuration}
          step={0.1}
          value={[currentTime]} 
          onValueChange={handleSliderChange}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(trackDuration)}</span>
        </div>
      </div>
      
      <audio ref={audioRef} src={trackUrl} preload="metadata" />
    </div>
  );
};
