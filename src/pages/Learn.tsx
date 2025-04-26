
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
                                  <GraduationCap className="h-4 w-4" />
                                  <span>Progress</span>
                                </div>
                                <span>0%</span>
                              </div>
                              <Progress value={0} className="h-2" />
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Learn;
