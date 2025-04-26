
import React, { useState, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Upload, X, File, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface TrackUploaderProps {
  projectId: string;
  userId: string;
  onUploadComplete?: () => void;
}

export const TrackUploader: React.FC<TrackUploaderProps> = ({ 
  projectId, 
  userId, 
  onUploadComplete 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const supportedTypes = [
    'audio/mpeg', // .mp3
    'audio/wav',  // .wav
    'audio/ogg',  // .ogg
    'audio/aac',  // .aac
    'audio/flac', // .flac
    'audio/x-m4a' // .m4a
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (!supportedTypes.includes(file.type)) {
      toast.error(`Unsupported file type. Please upload one of: .mp3, .wav, .ogg, .aac, .flac, .m4a`);
      return false;
    }
    
    // Max file size (30MB)
    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 30MB.');
      return false;
    }
    
    return true;
  };

  const calculateAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Calculate audio duration
      const duration = await calculateAudioDuration(file);
      
      // Upload file to Supabase storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExtension}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(fileName);

      // Create track record in database
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          file_url: urlData.publicUrl,
          project_id: projectId,
          user_id: userId,
          duration: duration,
          file_type: file.type,
          file_size: file.size
        })
        .select();

      if (error) throw error;

      toast.success('Track uploaded successfully!');
      setShowUploadModal(false);
      onUploadComplete?.();
    } catch (error) {
      console.error('Track upload error:', error);
      toast.error('Failed to upload track');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <Button 
        onClick={() => setShowUploadModal(true)}
        className="w-full flex items-center justify-center gap-2 p-4 bg-music-400 hover:bg-music-500 text-white"
      >
        <Upload className="h-5 w-5" />
        Upload New Track
      </Button>
      
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Track</DialogTitle>
            <DialogDescription>
              Upload audio files (.mp3, .wav, .ogg, etc.) to add to your project
            </DialogDescription>
          </DialogHeader>
          
          <div 
            className={`mt-4 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors
              ${dragActive ? 'border-music-400 bg-music-50' : 'border-muted'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".mp3,.wav,.ogg,.flac,.aac,.m4a"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            
            {isUploading ? (
              <div className="w-full space-y-4">
                <div className="text-center">Uploading {uploadProgress}%</div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            ) : (
              <>
                <p className="text-center mb-2">
                  Drag and drop your audio file here, or click to browse
                </p>
                <Button 
                  onClick={triggerFileInput}
                  variant="outline"
                  className="mt-2"
                >
                  Select File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: MP3, WAV, OGG, FLAC, AAC, M4A (max 30MB)
                </p>
              </>
            )}
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
