
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArtistCategory, DrumIcon, PianoIcon, GuitarIcon, MicrophoneIcon, HeadphonesIcon, NotesIcon } from "@/components/ArtistCategory";

const CreateProject = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const handleArtistToggle = (artist: string) => {
    if (selectedArtists.includes(artist)) {
      setSelectedArtists(selectedArtists.filter(a => a !== artist));
    } else {
      setSelectedArtists([...selectedArtists, artist]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating project:", {
      name: projectName,
      description: projectDescription,
      mode,
      collaborators: mode === "collaborate" ? selectedArtists : [],
    });
    
    // Navigate to dashboard or project page
    navigate("/dashboard");
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

                  {mode === "collaborate" && (
                    <div className="space-y-2">
                      <Label>Looking for</Label>
                      <div className="flex flex-wrap gap-3">
                        <ArtistCategory 
                          icon={<DrumIcon className="h-4 w-4" />} 
                          label="Drum Artists" 
                          isSelected={selectedArtists.includes("Drummer")}
                          onClick={() => handleArtistToggle("Drummer")}
                        />
                        <ArtistCategory 
                          icon={<PianoIcon className="h-4 w-4" />} 
                          label="Piano Artists" 
                          isSelected={selectedArtists.includes("Pianist")}
                          onClick={() => handleArtistToggle("Pianist")}
                        />
                        <ArtistCategory 
                          icon={<GuitarIcon className="h-4 w-4" />} 
                          label="Guitarists" 
                          isSelected={selectedArtists.includes("Guitarist")}
                          onClick={() => handleArtistToggle("Guitarist")}
                        />
                        <ArtistCategory 
                          icon={<MicrophoneIcon className="h-4 w-4" />} 
                          label="Vocalists" 
                          isSelected={selectedArtists.includes("Vocalist")}
                          onClick={() => handleArtistToggle("Vocalist")}
                        />
                        <ArtistCategory 
                          icon={<HeadphonesIcon className="h-4 w-4" />} 
                          label="Producers" 
                          isSelected={selectedArtists.includes("Producer")}
                          onClick={() => handleArtistToggle("Producer")}
                        />
                        <ArtistCategory 
                          icon={<NotesIcon className="h-4 w-4" />} 
                          label="Composers" 
                          isSelected={selectedArtists.includes("Composer")}
                          onClick={() => handleArtistToggle("Composer")}
                        />
                      </div>
                    </div>
                  )}

                  {mode === "learn" && (
                    <div className="space-y-2">
                      <Label>Learning Focus</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <LearningOption 
                          title="Production Basics" 
                          description="Learn the fundamentals of music production"
                        />
                        <LearningOption 
                          title="Instrument Skills" 
                          description="Improve your playing technique"
                        />
                        <LearningOption 
                          title="Music Theory" 
                          description="Understand the building blocks of music"
                        />
                        <LearningOption 
                          title="Song Writing" 
                          description="Create compelling musical compositions"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button type="submit" size="lg" className="bg-music-400 hover:bg-music-500 px-8">
                    Create Project
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

interface LearningOptionProps {
  title: string;
  description: string;
}

function LearningOption({ title, description }: LearningOptionProps) {
  return (
    <div className="flex items-start space-x-3 border rounded-md p-4 hover:border-music-300 cursor-pointer">
      <input type="radio" name="learning-focus" className="mt-1" />
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default CreateProject;
