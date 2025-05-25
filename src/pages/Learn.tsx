import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, User, Youtube, Lightbulb, MessageSquare, Trophy } from "lucide-react"; // Added Youtube, Lightbulb, MessageSquare, Trophy
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea

const Learn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['learning-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: modules } = useQuery({
    queryKey: ['learning-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select(`
          *,
          category:learning_categories(name)
        `)
        .order('created_at');
      if (error) throw error;
      return data;
    },
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null; // Ensure user is defined
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });


  // Placeholder data for new sections
  const liveCollaborations = [
    { id: 1, title: "Live Jazz Trio Session", description: "Watch a professional jazz trio collaborate in real-time.", url: "https://www.youtube.com/watch?v=example1" },
    { id: 2, title: "Electronic Music Production Stream", description: "Producer building a track from scratch, live.", url: "https://www.youtube.com/watch?v=example2" },
  ];

  const expertTutorials = [
    { id: 1, title: "Advanced Mixing Techniques", description: "Deep dive into professional mixing strategies.", url: "https://www.youtube.com/watch?v=expert1" },
    { id: 2, title: "Music Theory for Songwriters", description: "Unlock new songwriting possibilities.", url: "https://www.youtube.com/watch?v=expert2" },
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
                Master music theory, production, and composition with our structured learning paths
              </p>
            </div>
            {user && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/learn/bookmarks')}
              >
                <Bookmark className="h-4 w-4" />
                My Bookmarks
              </Button>
            )}
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {categories?.map((category) => (
                <section key={category.id}>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    {category.name}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {modules
                      ?.filter(module => module.category_id === category.id)
                      .map((module) => (
                        <Card key={module.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{module.title}</CardTitle>
                              <Badge variant={
                                module.difficulty_level === 'beginner' ? 'secondary' :
                                module.difficulty_level === 'intermediate' ? 'default' : 'destructive'
                              }>
                                {module.difficulty_level}
                              </Badge>
                            </div>
                            <CardDescription>{module.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>Progress</span>
                                </div>
                                <span>0%</span> {/* TODO: Integrate actual progress */}
                              </div>
                              <Progress value={0} className="h-2" /> {/* TODO: Integrate actual progress */}
                              <Button 
                                className="w-full" 
                                onClick={() => navigate(`/learn/module/${module.id}`)}
                              >
                                Start Learning
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                </section>
              ))}

              {/* New Section: Community & Extras */}
              <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Community & Extras</h2>
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
            </TabsContent>

            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <TabsContent key={level} value={level} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {modules
                    ?.filter(module => module.difficulty_level === level)
                    .map((module) => (
                      <Card key={module.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <Badge variant={
                              module.difficulty_level === 'beginner' ? 'secondary' :
                              module.difficulty_level === 'intermediate' ? 'default' : 'destructive'
                            }>
                              {module.difficulty_level}
                            </Badge>
                          </div>
                          <CardDescription>{module.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>Progress</span>
                              </div>
                              <span>0%</span> {/* TODO: Integrate actual progress */}
                            </div>
                            <Progress value={0} className="h-2" /> {/* TODO: Integrate actual progress */}
                            <Button 
                              className="w-full" 
                              onClick={() => navigate(`/learn/module/${module.id}`)}
                            >
                              Start Learning
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Learn;
