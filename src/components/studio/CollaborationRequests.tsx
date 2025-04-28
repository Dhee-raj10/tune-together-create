
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

export const CollaborationRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('collaboration_requests')
          .select(`
            id,
            message,
            status,
            created_at,
            projects:project_id (title),
            sender:from_user_id (id, full_name, avatar_url)
          `)
          .eq('to_user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setRequests(data || []);
      } catch (error) {
        console.error('Error fetching collaboration requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Set up realtime subscription for new requests
    const channel = supabase
      .channel('collaboration-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_requests',
          filter: `to_user_id=eq.${user.id}`,
        },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;

    try {
      // Update request status
      const { error } = await supabase
        .from('collaboration_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      // If accepted, add the user as a collaborator
      if (status === 'accepted') {
        const request = requests.find(req => req.id === requestId);
        if (request) {
          const { error: collabError } = await supabase
            .from('project_collaborators')
            .insert({
              project_id: request.projects.id,
              user_id: user.id,
              role: 'contributor'
            });

          if (collabError) throw collabError;
          
          toast.success(`You are now collaborating on "${request.projects.title}"`);
        }
      } else {
        toast.info('Collaboration request rejected');
      }

      // Update local state
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error handling collaboration request:', error);
      toast.error('Failed to process request');
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return null; // Don't show anything if no requests
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Collaboration Requests</h3>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-music-100 flex items-center justify-center">
                {request.sender?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium">
                  {request.sender?.full_name || 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Project: {request.projects?.title}
                </p>
              </div>
            </div>
            <p className="text-sm mb-3 p-2 bg-gray-50 rounded">
              "{request.message}"
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAction(request.id, 'rejected')}
              >
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => handleAction(request.id, 'accepted')}
                className="bg-music-400 hover:bg-music-500"
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
