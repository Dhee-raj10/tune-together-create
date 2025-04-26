
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProjectData {
  title: string;
  description?: string;
  mode: 'solo' | 'collaboration' | 'learning';
  collaboratorId?: string;
  selectedRoles?: string[];
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

      // Create the project first
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description || null,
          mode: projectData.mode,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        toast.error(`Error creating project: ${error.message}`);
        return null;
      }

      // If collaboration mode and we have a collaborator ID, set up the collaboration
      if (projectData.mode === 'collaboration' && projectData.collaboratorId) {
        const { error: collabError } = await supabase
          .from('project_collaborators')
          .insert({
            project_id: data.id,
            user_id: projectData.collaboratorId,
            role: projectData.selectedRoles && projectData.selectedRoles.length > 0 
              ? projectData.selectedRoles[0] 
              : 'contributor'
          });

        if (collabError) {
          toast.error(`Error setting up collaboration: ${collabError.message}`);
          // Continue anyway since the project was created
        } else {
          toast.success('Collaboration invitation sent!');
        }
      }

      // Navigate to the music studio
      navigate(`/studio/${data.id}`);
      return data;
    } catch (err) {
      console.error('Project creation error:', err);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createProject, isLoading };
};
