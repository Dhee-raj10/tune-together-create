
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Bookmark, CheckCircle, Play, File, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LearningModule = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: module } = useQuery({
    queryKey: ['learning-module', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select(`
          *,
          category:learning_categories(*)
        `)
        .eq('id', moduleId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: contents } = useQuery({
    queryKey: ['learning-content', moduleId],
    enabled: !!moduleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', moduleId],
    enabled: !!user && !!moduleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  const toggleBookmark = async (contentId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark content",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingProgress = userProgress?.find(p => p.content_id === contentId);
      
      if (existingProgress) {
        const { error } = await supabase
          .from('user_learning_progress')
          .update({ bookmarked: !existingProgress.bookmarked })
          .eq('id', existingProgress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_learning_progress')
          .insert({
            content_id: contentId,
            user_id: user.id,
            bookmarked: true
          });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Bookmark updated successfully"
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'pdf':
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!module || !contents) return null;

  const completedCount = userProgress?.filter(p => p.completed).length || 0;
  const progress = contents.length > 0 ? (completedCount / contents.length) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <span>{module.category.icon}</span>
                <span>{module.category.name}</span>
                <Badge>{module.difficulty_level}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
              <p className="text-muted-foreground mb-6">{module.description}</p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Course Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {contents.map((content, index) => {
                const progress = userProgress?.find(p => p.content_id === content.id);
                return (
                  <AccordionItem value={content.id} key={content.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                          {progress?.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            getContentIcon(content.content_type)
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{content.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)}
                            {content.duration && ` • ${Math.round(content.duration / 60)} min`}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <Button onClick={() => {/* Handle content navigation */}}>
                          Start Learning
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(content.id)}
                        >
                          <Bookmark
                            className={progress?.bookmarked ? "fill-current" : ""}
                          />
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningModule;
