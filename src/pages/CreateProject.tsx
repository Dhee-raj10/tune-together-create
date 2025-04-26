
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CollaboratorSelector } from "@/components/CollaboratorSelector";
import { ProfileList } from "@/components/ProfileList";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CreateProject = () => {
  const { mode } = useParams<{ mode: string }>();
  const location = useLocation();
  const { createProject, isLoading } = useProjects();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [collaboratorId, setCollaboratorId] = useState<string | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(true);
  const [showCollaboratorList, setShowCollaboratorList] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to create a project");
      navigate("/login", { state: { returnTo: location.pathname } });
    }
  }, [user, navigate, location]);

  // Parse URL params for collaborator ID
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const collaboratorParam = searchParams.get('collaborator');
    if (collaboratorParam) {
      setCollaboratorId(collaboratorParam);
      setShowRoleSelector(false);
      setShowCollaboratorList(false);
      toast.info("Collaboration setup with a selected user");
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to create a project');
      navigate('/login');
      return;
    }

    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    // Normalize the mode to match our expected types
    let normalizedMode: 'solo' | 'collaboration' | 'learning';
    if (mode === 'collaborate') {
      normalizedMode = 'collaboration';
    } else if (mode === 'learn') {
      normalizedMode = 'learning';
    } else {
      normalizedMode = 'solo';
    }

    const projectData = {
      title: projectName,
      description: projectDescription,
      mode: normalizedMode,
      // If we have a collaborator ID, we'll add it later in a separate API call
      collaboratorId: collaboratorId || undefined,
      selectedRoles: selectedRoles.length > 0 ? selectedRoles : undefined
    };

    const project = await createProject(projectData);
    if (project) {
      toast.success("Project created successfully!");
    }
  };

  const handleRoleSelect = (roles: string[]) => {
    setSelectedRoles(roles);
    if (mode === 'collaborate') {
      setShowCollaboratorList(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">
              {mode === "solo" && "Create Solo Project"}
              {mode === "collaborate" && "Start a Collaboration"}
              {mode === "learn" && "Begin Learning Project"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {mode === "solo" && "Create your own music project to work on independently."}
              {mode === "collaborate" && "Set up a project to collaborate with other musicians."}
              {mode === "learn" && "Create a project with learning resources and guidance."}
            </p>
          </div>

          {mode === "collaborate" && showRoleSelector && !collaboratorId && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">What type of musician are you looking for?</h2>
              <p className="text-muted-foreground mb-6">
                Select the roles you're seeking to collaborate with on this project.
              </p>
              <CollaboratorSelector onSelectRoles={handleRoleSelect} />
            </div>
          )}

          {mode === "collaborate" && showCollaboratorList && !collaboratorId && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Available Musicians</h2>
              <p className="text-muted-foreground mb-6">
                {selectedRoles.length > 0 
                  ? `Showing musicians with ${selectedRoles.join(', ')} expertise` 
                  : 'Showing all available musicians'}
              </p>
              <ProfileList selectedRoles={selectedRoles} />
            </div>
          )}

          {(mode !== "collaborate" || collaboratorId || !showRoleSelector) && (
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

                    {mode === "collaborate" && !collaboratorId && (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowRoleSelector(true);
                            setShowCollaboratorList(false);
                          }}
                        >
                          Back to Role Selection
                        </Button>
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
          )}
        </div>
      </main>
      <Footer />
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#e5ddff_100%)]" />
    </div>
  );
};

export default CreateProject;
