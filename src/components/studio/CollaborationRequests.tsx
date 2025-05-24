import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, X, Music } from 'lucide-react';

interface CollaborationRequest {
  id: string;
  message: string;
  status: string;
  created_at: string;
  project_id: string;
  from_user_id: string;
  projects: { // This comes from the join
    id: string;
    title: string;
  };
  sender: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const CollaborationRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      setLoading(true); // Ensure loading is true at the start of fetch
      try {
        // First, fetch collaboration requests with project info
        const { data: requestsData, error: requestsError } = await supabase
          .from('collaboration_requests')
          .select(`
            id,
            message,
            status,
            created_at,
            project_id, 
            from_user_id,
            projects:project_id (
              id,
              title
            )
          `)
          .eq('to_user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        if (!requestsData || requestsData.length === 0) {
          setRequests([]);
          setLoading(false); // Added to stop loading if no data
          return;
        }

        // Get unique sender IDs
        const senderIds = [...new Set(requestsData.map(req => req.from_user_id))];

        if (senderIds.length === 0) { // Handle case where senderIds might be empty
            setRequests([]);
            setLoading(false);
            return;
        }

        // Fetch sender profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', senderIds);

        if (profilesError) throw profilesError;
        
        // Ensure profilesData is not null before mapping
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        // Combine requests with sender information
        const transformedData: CollaborationRequest[] = requestsData.map(req => {
          const senderProfile = profilesMap.get(req.from_user_id);
          
          // Ensure req.projects is correctly accessed and is not null
          const projectTitle = req.projects?.title || 'Unknown Project';
          const projectIdFromJoin = req.projects?.id || req.project_id; // Fallback if join fails for some reason

          return {
            id: req.id,
            message: req.message,
            status: req.status,
            created_at: req.created_at,
            project_id: req.project_id, // This is the FK in collaboration_requests
            from_user_id: req.from_user_id,
            projects: { // Ensure this structure matches the interface
                id: projectIdFromJoin,
                title: projectTitle
            },
            sender: {
              id: req.from_user_id,
              full_name: senderProfile?.full_name || null,
              username: senderProfile?.username || null,
              avatar_url: senderProfile?.avatar_url || null
            }
          };
        });
        
        setRequests(transformedData);
      } catch (error) {
        console.error('Error fetching collaboration requests:', error);
        toast.error('Failed to load collaboration requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Set up realtime subscription for new requests
    const channel = supabase
      .channel(`collaboration-requests-to-${user.id}`) // More specific channel name
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_requests',
          filter: `to_user_id=eq.${user.id}`,
        },
        (payload) => {
            console.log('New collaboration request received:', payload);
            fetchRequests(); // Re-fetch all requests to update the list
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'collaboration_requests',
          filter: `to_user_id=eq.${user.id}`,
        },
        (payload) => {
            console.log('Collaboration request updated:', payload);
            fetchRequests(); // Re-fetch to reflect status changes made by sender etc.
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to collaboration requests channel');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Subscription error on collaboration requests:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;

    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('collaboration_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('to_user_id', user.id); // Ensure only the recipient can update

      if (updateError) throw updateError;

      // If accepted, add the user as a collaborator
      if (status === 'accepted') {
        const request = requests.find(req => req.id === requestId);
        if (request && request.project_id) { // Ensure request and project_id exist
          const { error: collabError } = await supabase
            .from('project_collaborators')
            .insert({
              project_id: request.project_id, // Use project_id from the request itself
              user_id: user.id,
              role: 'contributor' 
            });

          if (collabError) throw collabError;
          
          toast.success(`You are now collaborating on "${request.projects?.title || 'the project'}"`);
        } else {
            // This case should ideally not happen if data is consistent
            throw new Error("Could not find request details or project ID to accept collaboration.");
        }
      } else {
        toast.info('Collaboration request rejected');
      }

      // Update local state by removing the processed request
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error: any) {
      console.error('Error handling collaboration request:', error);
      const errorMessage = error.message || 'An unknown error occurred.';
      toast.error(`Failed to process request: ${errorMessage}`);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground p-4">Loading collaboration requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No pending collaboration requests.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card shadow">
      <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
        <Music className="h-6 w-6 text-music-500" />
        Collaboration Requests
      </h3>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-1 w-10 h-10 rounded-full bg-music-100 flex items-center justify-center text-music-500 font-semibold">
                {request.sender?.full_name?.charAt(0)?.toUpperCase() || request.sender?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-700">
                  {request.sender?.full_name || request.sender?.username || 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Wants to collaborate on: <span className="font-medium text-music-600">{request.projects?.title || 'Project Title Missing'}</span>
                </p>
                 <p className="text-xs text-gray-400">
                  Received: {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {request.message && (
              <p className="text-sm mb-3 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-600">
                "{request.message}"
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAction(request.id, 'rejected')}
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => handleAction(request.id, 'accepted')}
                className="bg-green-500 hover:bg-green-600 text-white"
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
