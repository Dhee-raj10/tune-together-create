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
import { TrackUploader } from "@/components/TrackUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectFlow } from "@/hooks/useProjectFlow";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TrackPlayer } from "@/components/TrackPlayer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const CreateProject = () => {
  const { mode } = useParams<{ mode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [collaboratorId, setCollaboratorId] = useState<string | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(true);
  const [showCollaboratorList, setShowCollaboratorList] = useState(false);
  const [collaborationMessage, setCollaborationMessage] = useState("");
  const [showCollabDialog, setShowCollabDialog] = useState(false);
  const [uploadedTrack, setUploadedTrack] = useState<any>(null);

  const { 
    flowState, 
    isProcessing, 
    createInitialProject, 
    advanceToIntegration, 
    completeProjectSetup 
  } = useProjectFlow();

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
      // Show collaboration dialog on collaborator selection
      if (mode === 'collaborate') {
        setShowCollabDialog(true);
      }
    }
  }, [location.search, mode]);

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

    let normalizedMode: 'solo' | 'collaboration' | 'learning';
    if (mode === 'collaborate') {
      normalizedMode = 'collaboration';
    } else if (mode === 'learn') {
      normalizedMode = 'learning';
    } else {
      normalizedMode = 'solo';
    }

    const projectId = await createInitialProject(projectName, projectDescription, normalizedMode);
    
    // For collaboration mode with a specific collaborator, send the request immediately
    if (projectId && mode === 'collaborate' && collaboratorId) {
      setShowCollabDialog(true);
    }
  };

  const handleSendCollaborationRequest = async () => {
    if (!flowState.projectId || !collaboratorId || !user) {
      toast.error('Cannot send collaboration request');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('collaboration_requests')
        .insert({
          project_id: flowState.projectId,
          from_user_id: user.id,
          to_user_id: collaboratorId,
          message: collaborationMessage || `Hi! I'd like to collaborate with you on my project "${projectName}". Would you be interested in working together?`
        });

      if (error) throw error;
      
      toast.success('Collaboration request sent!');
      setShowCollabDialog(false);
      
      // Navigate to the project studio
      navigate(`/studio/${flowState.projectId}`);
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      toast.error('Failed to send collaboration request');
    }
  };

  const handleUploadComplete = (trackData: any) => {
    setUploadedTrack(trackData);
    advanceToIntegration();
  };

  const handleFinalizeProject = () => {
    completeProjectSetup();
    navigate(`/studio/${flowState.projectId}`);
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

          {flowState.step === 'details' && (
            <>
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
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Creating..." : "Create Project"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {flowState.step === 'upload' && flowState.projectId && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Upload Your First Track</h2>
              <p className="text-muted-foreground">
                Add your first track to get started with your project.
              </p>
              <TrackUploader
                projectId={flowState.projectId}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}

          {flowState.step === 'integration' && flowState.projectId && uploadedTrack && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Test Your Track</h2>
              <p className="text-muted-foreground">
                Make sure your track sounds good before finalizing your project.
              </p>
              <TrackPlayer
                trackUrl={uploadedTrack.file_url}
                title={uploadedTrack.title}
                duration={uploadedTrack.duration}
              />
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={handleFinalizeProject}
                  size="lg" 
                  className="bg-music-400 hover:bg-music-500 px-8"
                >
                  Finalize Project
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#e5ddff_100%)]" />

      {/* Collaboration Request Dialog */}
      <Dialog open={showCollabDialog} onOpenChange={setShowCollabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Collaboration Request</DialogTitle>
            <DialogDescription>
              Send a message to the musician explaining what you'd like to collaborate on.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collab-message">Message</Label>
              <Textarea
                id="collab-message"
                placeholder={`Hi! I'd like to collaborate with you on my project "${projectName}". Would you be interested in working together?`}
                rows={4}
                value={collaborationMessage}
                onChange={(e) => setCollaborationMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCollabDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendCollaborationRequest}
              disabled={!flowState.projectId}
              className="bg-music-400 hover:bg-music-500"
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProject;
