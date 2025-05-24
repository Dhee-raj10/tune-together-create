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

interface ProjectSettingsData {
  master_volume?: number;
  tempo?: number;
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

  const updateProjectSettings = async (projectId: string, settings: ProjectSettingsData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          master_volume: settings.master_volume,
          tempo: settings.tempo,
          updated_at: new Date().toISOString(), // Explicitly update timestamp
        })
        .eq('id', projectId);

      if (error) {
        toast.error(`Error updating project settings: ${error.message}`);
        console.error("Error updating project settings:", error);
        return false;
      }

      toast.success('Project settings saved!');
      return true;
    } catch (err) {
      console.error('Project settings update error:', err);
      toast.error('An unexpected error occurred while saving settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfilesByRoles = async (roles: string[]) => {
    try {
      if (!roles || roles.length === 0) {
        // If no roles specified, return all profiles except the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return [];
        }
        
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);
          
        return data || [];
      }
      
      // Get the current user to exclude them from results
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }
      
      // Find profiles that have ANY of the requested roles (using containedBy for array overlap)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .filter('roles', 'cs', `{${roles.join(',')}}`);
        
      return data || [];
    } catch (error) {
      console.error('Error fetching profiles by roles:', error);
      return [];
    }
  };

  return { createProject, getProfilesByRoles, updateProjectSettings, isLoading };
};
