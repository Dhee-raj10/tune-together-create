import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Music, Upload, X } from 'lucide-react';
import { formatTime } from '@/lib/formatTime';
import { useAuth } from '@/contexts/AuthContext';

interface TrackUploaderProps {
  projectId: string;
  onUploadComplete?: (trackData: any) => void;
}

export const TrackUploader: React.FC<TrackUploaderProps> = ({ projectId, onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [trackDuration, setTrackDuration] = useState<number | null>(null);
  const { user } = useAuth();

  const getTrackDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      });
      
      audio.addEventListener('error', () => {
        console.warn('Error loading audio metadata, duration set to 0.');
        resolve(0);
        URL.revokeObjectURL(audio.src);
      });
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload MP3, WAV, or OGG files.');
      return;
    }
    
    const duration = await getTrackDuration(file);
    setTrackDuration(duration);
    
    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
    },
    maxFiles: 1,
  });

  const uploadTrack = async () => {
    if (!selectedFile || !projectId || !user) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`; // Files will be stored in a folder named after the projectId
      
      const fileOptions = {
        cacheControl: '3600',
        upsert: false,
      };
        
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, selectedFile, fileOptions);
        
      if (uploadError) {
        // Check if the error is due to an existing file if upsert is false, though less likely with unique names
        if (uploadError.message.includes('The resource already exists')) {
             toast.error('A file with this name path already exists. Please try renaming or a different file.');
        } else {
            throw uploadError;
        }
      }
      
      setUploadProgress(100);

      const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData?.publicUrl;
      
      if (!publicUrl) {
        throw new Error('Failed to get public URL for the uploaded file.');
      }
      
      const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .insert({
          project_id: projectId,
          user_id: user.id,
          title: selectedFile.name.split('.')[0],
          file_url: publicUrl,
          duration: trackDuration || 0,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
        })
        .select()
        .single();

      if (trackError) {
        throw trackError;
      }
      
      toast.success('Track uploaded successfully');
      setSelectedFile(null);
      setTrackDuration(null);
      
      if (onUploadComplete) {
        onUploadComplete(trackData);
      }
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Error uploading track:', error);
      toast.error(`Failed to upload track: ${error.message || 'Unknown error'}`);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setTrackDuration(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Music className="mr-2" size={20} />
        Upload Track
      </h3>
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium">
            {isDragActive
              ? 'Drop the audio file here...'
              : 'Drag and drop an audio file, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Supports MP3, WAV, OGG</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
            <div className="flex items-center min-w-0">
              <Music className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
              <div className="truncate">
                <p className="font-medium truncate" title={selectedFile.name}>{selectedFile.name}</p>
                <div className="flex text-xs text-gray-500">
                  <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  {trackDuration && (
                    <span className="ml-2">Length: {formatTime(trackDuration)}</span>
                  )}
                </div>
              </div>
            </div>
            {!isUploading && (
              <button onClick={cancelUpload} className="text-gray-500 hover:text-red-500 ml-2 flex-shrink-0">
                <X size={18} />
              </button>
            )}
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-xs text-center">{Math.round(uploadProgress)}% Complete</p>
            </div>
          ) : (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelUpload}>
                Clear Selection
              </Button>
              <Button 
                onClick={uploadTrack}
                className="bg-music-400 hover:bg-music-500"
              >
                Upload Track
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
