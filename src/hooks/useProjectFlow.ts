
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectFlowState {
  step: 'details' | 'upload' | 'complete';
  projectId: string | null;
}

export const useProjectFlow = () => {
  const [flowState, setFlowState] = useState<ProjectFlowState>({
    step: 'details',
    projectId: null,
  });

  const createInitialProject = async (title: string, description: string | null, mode: 'solo' | 'collaboration' | 'learning') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a project');
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          mode,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setFlowState({
        step: 'upload',
        projectId: data.id
      });

      return data.id;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const completeProjectSetup = () => {
    setFlowState(prev => ({ ...prev, step: 'complete' }));
    toast.success('Project created successfully!');
  };

  return {
    flowState,
    createInitialProject,
    completeProjectSetup
  };
};
