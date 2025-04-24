import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Update the Project interface to include type guard for mode
interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: 'solo' | 'collaboration' | 'learning';
  created_at: string;
}

// Type guard function to validate mode
function isValidProjectMode(mode: string): mode is Project['mode'] {
  return ['solo', 'collaboration', 'learning'].includes(mode);
}

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Validate the mode before setting the project
        if (data && isValidProjectMode(data.mode)) {
          setProject(data as Project);
        } else {
          console.error('Invalid project mode');
          setProject(null);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  if (isLoading) {
    return <div className="container py-8">Loading your music project... 🎵</div>;
  }

  if (!project) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-xl">Project not found 😢</p>
          <Button asChild className="mt-4">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Mode:</span>
            <span className="capitalize">{project.mode}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Created:</span>
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
