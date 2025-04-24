
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CollaboratorSelector } from "@/components/CollaboratorSelector";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";

const CreateProject = () => {
  const { mode } = useParams<{ mode: string }>();
  const { createProject, isLoading } = useProjects();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (mode !== 'solo' && mode !== 'collaboration' && mode !== 'learn') {
      toast.error('Invalid project mode');
      return;
    }

    await createProject({
      title: projectName,
      description: projectDescription,
      mode: mode as 'solo' | 'collaboration' | 'learning'
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">
              {mode === "solo" && "Create Solo Project"}
              {mode === "collaboration" && "Start a Collaboration"}
              {mode === "learn" && "Begin Learning Project"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {mode === "solo" && "Create your own music project to work on independently."}
              {mode === "collaboration" && "Set up a project to collaborate with other musicians."}
              {mode === "learn" && "Create a project with learning resources and guidance."}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="My Awesome Track"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-description">Project Description</Label>
                    <Textarea
                      id="project-description"
                      placeholder="Describe your project, style, and what you're aiming to create..."
                      rows={4}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>

                  {mode === "collaboration" && (
                    <div className="space-y-2">
                      <Label>Looking for Collaborators</Label>
                      <CollaboratorSelector 
                        onSelectRoles={setSelectedRoles} 
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-music-400 hover:bg-music-500 px-8"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Project...' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#e5ddff_100%)]" />
    </div>
  );
};

export default CreateProject;
