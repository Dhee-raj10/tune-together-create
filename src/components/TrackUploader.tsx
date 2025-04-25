
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrackUploaderProps {
  projectId: string;
  userId: string;
  onUploadComplete: () => void;
}

export const TrackUploader = ({ projectId, userId, onUploadComplete }: TrackUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUploader, setShowUploader] = useState(false);
  
  const allowedFileTypes = [
    'audio/mpeg', // .mp3
    'audio/wav',  // .wav
    'audio/ogg',  // .ogg
    'audio/x-m4a' // .m4a
  ];
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload MP3, WAV, or OGG files.');
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${projectId}/${Date.now()}.${fileExt}`;
      
      // Upload the file with progress monitoring
      const { error: uploadError, data } = await supabase.storage
        .from('tracks')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setProgress(percent);
          },
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filePath);
      
      // Get audio duration
      const audioElement = new Audio();
      audioElement.src = publicUrl;
      
      // Wait for metadata to load to get duration
      await new Promise((resolve) => {
        audioElement.onloadedmetadata = () => resolve(null);
      });
      
      const duration = audioElement.duration;
      
      // Save track info to the database
      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          project_id: projectId,
          user_id: userId,
          file_url: publicUrl,
          title: file.name.split('.')[0], // Use filename without extension as title
          duration: duration,
          file_type: file.type,
          file_size: file.size
        });
        
      if (dbError) throw dbError;
      
      toast.success('Track uploaded successfully!');
      onUploadComplete();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setShowUploader(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!allowedFileTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload MP3, WAV, or OGG files.');
      return;
    }
    
    // Create a FileList-like object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Create a synthetic event to reuse the file upload logic
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.files = dataTransfer.files;
    
    // Manually trigger the file upload handler
    handleFileUpload({ target: { files: dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };
  
  return (
    <div>
      {!showUploader ? (
        <Button 
          onClick={() => setShowUploader(true)} 
          variant="outline"
          className="flex items-center gap-2 w-full"
        >
          <Upload size={16} />
          Upload New Track
        </Button>
      ) : (
        <div 
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 bg-muted/20 relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">Uploading...</p>
              <Progress value={progress} />
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to upload audio files
                <br />
                <span className="text-xs">(MP3, WAV, OGG formats)</span>
              </p>
              <input
                type="file"
                accept="audio/mpeg,audio/wav,audio/ogg,audio/x-m4a"
                onChange={handleFileUpload}
                className="hidden"
                id="track-upload"
              />
              <label htmlFor="track-upload">
                <Button variant="secondary" size="sm" className="mx-auto">
                  Choose File
                </Button>
              </label>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setShowUploader(false)}
            disabled={isUploading}
          >
            <X size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};
