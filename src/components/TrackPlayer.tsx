
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Repeat, Volume2, VolumeX, SkipBack } from 'lucide-react';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/formatTime';

interface TrackPlayerProps {
  trackUrl: string;
  title: string;
  duration?: number;
}

export const TrackPlayer: React.FC<TrackPlayerProps> = ({ 
  trackUrl, 
  title, 
  duration = 0
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [audioDuration, setAudioDuration] = useState(duration || 0);

  useEffect(() => {
    // Initialize audio element
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const handleCanPlay = () => setLoadingAudio(false);
    const handleDurationChange = () => {
      if (audioElement.duration && !isNaN(audioElement.duration)) {
        setAudioDuration(audioElement.duration);
      }
    };
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };
    
    // Set initial properties
    audioElement.loop = isLooping;
    audioElement.volume = volume;
    
    // Add event listeners
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('durationchange', handleDurationChange);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);
    
    // Clean up
    return () => {
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('durationchange', handleDurationChange);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isLooping]);

  // Update audio properties when state changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = isLooping;
  }, [isLooping]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

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
  
  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const seekTime = value[0];
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        handlePlay();
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-4 bg-muted/50 rounded-lg">
      <audio 
        ref={audioRef} 
        src={trackUrl}
        preload="metadata"
      />
      
      <div className="flex justify-between items-center">
        <div className="flex-1 truncate pr-4">
          <h4 className="font-medium truncate">{title}</h4>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            onClick={handleRestart} 
            variant="ghost" 
            size="sm"
            className="rounded-full h-8 w-8 p-1"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          {isPlaying ? (
            <Button 
              onClick={handlePause} 
              variant="outline" 
              size="sm"
              className="rounded-full h-9 w-9 p-1"
            >
              <Pause className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={handlePlay} 
              variant={loadingAudio ? "outline" : "default"}
              size="sm"
              className="rounded-full h-9 w-9 p-1 bg-music-400 hover:bg-music-500 text-white"
              disabled={loadingAudio}
            >
              <Play className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            onClick={handleToggleLoop} 
            variant="ghost" 
            size="sm"
            className={`rounded-full h-8 w-8 p-1 ${isLooping ? 'text-music-400' : 'text-muted-foreground'}`}
          >
            <Repeat className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleToggleMute} 
            variant="ghost" 
            size="sm"
            className="rounded-full h-8 w-8 p-1"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <div className="w-16 hidden sm:block">
            <Slider
              defaultValue={[volume]}
              max={1}
              step={0.01}
              value={[volume]}
              onValueChange={handleVolumeChange}
              className="h-1"
            />
          </div>
        </div>
      </div>
      
      <Slider 
        value={[currentTime]}
        max={audioDuration || 0}
        step={0.01}
        onValueChange={handleSeek}
        disabled={audioDuration === 0}
        className="h-1"
      />
    </div>
  );
};
