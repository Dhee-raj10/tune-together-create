
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProjectData {
  title: string;
  description?: string;
  mode: 'solo' | 'collaboration' | 'learning';
}

export const useProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createProject = async (projectData: ProjectData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a project');
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        toast.error(`Error creating project: ${error.message}`);
        return null;
      }

      toast.success('Project created successfully!');
      navigate(`/project/${data.id}`);
      return data;
    } catch (err) {
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createProject, isLoading };
};
