
import React, { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload .mp3, .wav, or .ogg files.');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExtension}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(fileName);

      // Create track record in database
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          title: file.name,
          file_url: urlData.publicUrl,
          project_id: projectId,
          user_id: userId,
          duration: 0, // TODO: Implement audio duration calculation
          file_type: file.type,
          file_size: file.size
        })
        .select();

      if (error) throw error;

      toast.success('Track uploaded successfully!');
      onUploadComplete?.();
    } catch (error) {
      console.error('Track upload error:', error);
      toast.error('Failed to upload track');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".mp3,.wav,.ogg"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
      <button 
        onClick={triggerFileInput}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Upload className="h-6 w-6" />
        {isUploading ? 'Uploading...' : 'Upload Track'}
      </button>
    </div>
  );
};
