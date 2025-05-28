
import React from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Lightbulb, MessageSquare, Trophy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "react-router-dom";

const Learn = () => {
  const location = useLocation();

  // Scroll to hash link if present
  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  // Updated live collaborations with actual YouTube links
  const liveCollaborations = [
    { id: 1, title: "Live Jazz Trio Session", description: "Watch a professional jazz trio collaborate in real-time.", url: "https://youtu.be/uHFJ9qhR0VM?si=CpFAxrnuOXofuhVk" },
    { id: 2, title: "Electronic Music Production Stream", description: "Producer building a track from scratch, live.", url: "https://youtu.be/Hi72cCOPUQU?si=TfHwsoh-kaSofUTy" },
  ];

  // Updated expert tutorials with actual YouTube links
  const expertTutorials = [
    { id: 1, title: "Advanced Mixing Techniques", description: "Deep dive into professional mixing strategies.", url: "https://youtu.be/6YwWKn6k0Mg?si=eOl6eRlWYFMntQkC" },
    { id: 2, title: "Music Theory for Songwriters", description: "Unlock new songwriting possibilities.", url: "https://youtube.com/playlist?list=PLViqYKpnxtKotCmlxW4tRh7HCqqKOkaA9&si=hvy4-lD6bfyQ0hwX" },
  ];

  const musicChallenges = [
    { id: 1, title: "Monthly Melody Challenge", description: "Create a compelling melody using only 3 notes. Submit by end of month!", details: "Theme: Nostalgia. Prize: Featured on our homepage." },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Hub</h1>
              <p className="text-muted-foreground">
                Connect with the community and explore additional learning resources
              </p>
            </div>
          </div>

          {/* Learning Hub Section */}
          <section id="learning-hub" className="scroll-mt-20">
            <div className="space-y-8">

              {/* Watch Live Collaborations */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Youtube className="h-6 w-6 text-red-600" /> Watch Live Collaborations
                </h3>
                <p className="text-muted-foreground mb-4">See how professional musicians work together in real-time sessions.</p>
                <div className="grid gap-6 md:grid-cols-2">
                  {liveCollaborations.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" onClick={() => window.open(item.url, '_blank')}>
                          Watch on YouTube
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Expert Tutorials */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-500" /> Expert Tutorials
                </h3>
                <p className="text-muted-foreground mb-4">Expand your knowledge with tutorials from industry experts.</p>
                <div className="grid gap-6 md:grid-cols-2">
                  {expertTutorials.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" onClick={() => window.open(item.url, '_blank')}>
                          View Tutorial
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Feedback Sessions */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-500" /> Feedback Sessions
                </h3>
                <p className="text-muted-foreground mb-4">Watched a session or tutorial? Share your thoughts and help us improve!</p>
                <Card className="p-6">
                  <CardContent className="p-0">
                    <Textarea placeholder="Type your feedback here..." className="mb-4" />
                    <Button disabled>Submit Feedback (Coming Soon)</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: Feedback submission is not yet functional. We're working on it!
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Music Challenges */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-green-500" /> Music Challenges
                </h3>
                <p className="text-muted-foreground mb-4">Test your skills and creativity with our regular music challenges.</p>
                <div className="grid gap-6">
                  {musicChallenges.map(challenge => (
                    <Card key={challenge.id} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                      <CardHeader>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">{challenge.description}</p>
                        <p className="text-sm opacity-80">{challenge.details}</p>
                        <Button variant="secondary" className="mt-4 w-full text-purple-700">
                          Participate (Coming Soon)
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Learn;
