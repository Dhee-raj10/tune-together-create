import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Music, Check, X, Loader2 } from 'lucide-react';
import { TrackPlayer } from './TrackPlayer';
import { useAuth } from '@/contexts/AuthContext';

interface AISuggestion {
  id: string; 
  project_id: string; 
  user_id: string; 
  created_at: string; 
  audioUrl: string; 
  title: string;
  instrument: string;
  style: string;
  generation_mode: string; 
  bars: number;
  duration?: number;
  text_prompt?: string | null; 
  is_accepted: boolean; 
  is_discarded: boolean; 
}

interface AISuggestionPanelProps {
  projectId: string;
  onSuggestionAccepted: () => void;
}

export const AISuggestionPanel = ({ projectId, onSuggestionAccepted }: AISuggestionPanelProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);
  const [instrument, setInstrument] = useState('');
  const [style, setStyle] = useState('');
  const [bars, setBars] = useState('4');
  const [selectedGenerationMode, setSelectedGenerationMode] = useState('');
  const [textPrompt, setTextPrompt] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasExistingTracks, setHasExistingTracks] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingTracksAndFetchSuggestion = async () => {
      setLoading(true);
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const { count: trackCount, error: tracksError } = await supabase
          .from('tracks')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId);

        if (tracksError) throw tracksError;
        setHasExistingTracks((trackCount || 0) > 0);

        const { data: suggestionData, error: suggestionError } = await supabase
          .from('ai_suggestions')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_accepted', false)
          .eq('is_discarded', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (suggestionError) {
          console.error('Error fetching latest AI suggestion:', suggestionError);
        }
        
        if (suggestionData) {
          setCurrentSuggestion({
            id: suggestionData.id,
            project_id: suggestionData.project_id,
            user_id: suggestionData.user_id,
            created_at: suggestionData.created_at,
            audioUrl: suggestionData.audio_url,
            title: suggestionData.title,
            instrument: suggestionData.instrument,
            style: suggestionData.style,
            generation_mode: suggestionData.generation_mode,
            bars: suggestionData.bars,
            duration: suggestionData.duration || undefined,
            text_prompt: suggestionData.text_prompt || null,
            is_accepted: suggestionData.is_accepted,
            is_discarded: suggestionData.is_discarded,
          });
        }
      } catch (error) {
        console.error('Error in initial data load for AI Panel:', error);
        toast.error('Failed to load initial AI panel data.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId && user) {
        checkExistingTracksAndFetchSuggestion();
    } else if (!user) {
        setLoading(false); 
    }
  }, [projectId, user]);

  const instruments = [
    { value: 'piano', label: '🎹 Piano' },
    { value: 'drums', label: '🥁 Drums' },
    { value: 'guitar', label: '🎸 Guitar' },
    { value: 'bass', label: '🎸 Bass' },
    { value: 'synth', label: '🎹 Synth' },
    { value: 'strings', label: '🎻 Strings' }
  ];

  const styles = [
    { value: 'lofi', label: '🎵 Lo-fi' },
    { value: 'edm', label: '🎧 EDM' },
    { value: 'jazz', label: '🎺 Jazz' },
    { value: 'rock', label: '🎸 Rock' },
    { value: 'pop', label: '🎤 Pop' },
    { value: 'classical', label: '🎼 Classical' }
  ];

  const generationModes = [ 
    { value: 'melody', label: '🎶 Melody' },
    { value: 'chord', label: '🎹 Chord Progression' },
    { value: 'beat', label: '🥁 Beat' },
    { value: 'continue', label: '⚙️ Continue Existing' }
  ];

  const barOptions = [
    { value: '2', label: '2 Bars' },
    { value: '4', label: '4 Bars' },
    { value: '8', label: '8 Bars' },
    { value: '16', label: '16 Bars' }
  ];

  const handleGenerateSuggestion = async () => {
    if (!instrument || !style || !selectedGenerationMode) {
      toast.error('Please select instrument, style, and mode');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to generate suggestions.');
      return;
    }

    setIsGenerating(true);
    setCurrentSuggestion(null); 
    
    try {
      console.log('Calling AI suggestion function...');
      const { data: edgeFnResponse, error: edgeFnError } = await supabase.functions.invoke('generate-music-ai', {
        body: {
          projectId,
          instrument,
          style,
          mode: selectedGenerationMode, 
          bars: parseInt(bars),
          textPrompt
        }
      });

      if (edgeFnError) {
        console.error('Edge function error:', edgeFnError);
        throw edgeFnError;
      }

      console.log('AI suggestion response from edge function:', edgeFnResponse);
      
      if (edgeFnResponse && edgeFnResponse.suggestion) {
        const edgeFnSuggestion = edgeFnResponse.suggestion;
        const newSuggestionData = {
          project_id: projectId,
          user_id: user.id,
          title: edgeFnSuggestion.title,
          audio_url: edgeFnSuggestion.audioUrl,
          instrument: edgeFnSuggestion.instrument,
          style: edgeFnSuggestion.style,
          generation_mode: edgeFnSuggestion.mode, 
          bars: edgeFnSuggestion.bars,
          duration: edgeFnSuggestion.duration,
          text_prompt: textPrompt || null,
          is_accepted: false,
          is_discarded: false,
        };

        const { data: savedSuggestion, error: saveError } = await supabase
          .from('ai_suggestions')
          .insert(newSuggestionData)
          .select()
          .single();

        if (saveError) {
          console.error('Error saving AI suggestion to DB:', saveError);
          throw saveError;
        }

        setCurrentSuggestion({
          id: savedSuggestion.id,
          project_id: savedSuggestion.project_id,
          user_id: savedSuggestion.user_id,
          created_at: savedSuggestion.created_at,
          audioUrl: savedSuggestion.audio_url,
          title: savedSuggestion.title,
          instrument: savedSuggestion.instrument,
          style: savedSuggestion.style,
          generation_mode: savedSuggestion.generation_mode,
          bars: savedSuggestion.bars,
          duration: savedSuggestion.duration || undefined,
          text_prompt: savedSuggestion.text_prompt || null,
          is_accepted: savedSuggestion.is_accepted,
          is_discarded: savedSuggestion.is_discarded,
        });
        toast.success('🎵 AI suggestion generated and saved!');
      } else {
        throw new Error('Invalid response from AI service or missing suggestion data');
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast.error('Failed to generate AI suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!currentSuggestion || !currentSuggestion.id) return;
    if (!user) { 
      toast.error('You must be logged in to accept suggestions');
      return;
    }

    setIsAccepting(true);
    try {
      const { error: updateError } = await supabase
        .from('ai_suggestions')
        .update({ is_accepted: true, updated_at: new Date().toISOString() })
        .eq('id', currentSuggestion.id);

      if (updateError) {
        console.error('Error marking suggestion as accepted:', updateError);
        toast.error('Failed to update suggestion status.');
        setIsAccepting(false);
        return;
      }
      
      const suggestionTitle = `AI ${currentSuggestion.title}`;
      console.log('Adding AI suggestion to tracks:', {
        project_id: projectId,
        title: suggestionTitle,
        file_url: currentSuggestion.audioUrl,
        user_id: user.id, 
        file_type: 'audio/wav', 
        duration: currentSuggestion.duration || (currentSuggestion.bars * 2)
      });

      const { error: trackInsertError } = await supabase.from('tracks').insert({
        project_id: projectId,
        title: suggestionTitle,
        file_url: currentSuggestion.audioUrl,
        user_id: user.id,
        file_type: 'audio/wav', 
        duration: currentSuggestion.duration || (currentSuggestion.bars * 2) 
      });

      if (trackInsertError) {
        console.error('Error adding suggestion to tracks:', trackInsertError);
        toast.error('Failed to add suggestion to project tracks. Suggestion status was updated.');
        throw trackInsertError;
      }

      toast.success('🎵 AI suggestion accepted and added to your project!');
      setCurrentSuggestion(null); 
      onSuggestionAccepted(); 
      setHasExistingTracks(true); 
      
      setInstrument('');
      setStyle('');
      setSelectedGenerationMode('');
      setBars('4');
      setTextPrompt('');
      
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      if (!toast || !(toast as any).isToastVisible) { 
          toast.error('Failed to process suggestion acceptance.');
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDiscardSuggestion = async () => {
    if (!currentSuggestion || !currentSuggestion.id) return;

    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ is_discarded: true, updated_at: new Date().toISOString() })
        .eq('id', currentSuggestion.id);

      if (error) {
        console.error('Error discarding suggestion:', error);
        toast.error('Failed to discard suggestion.');
        return;
      }
      setCurrentSuggestion(null);
      toast.info('Suggestion discarded');
    } catch (err) {
        console.error('Unexpected error discarding suggestion:', err);
        toast.error('An unexpected error occurred while discarding.');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading AI Suggestions...</div>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5 text-music-400" />
        <h3 className="text-lg font-semibold">🎵 AI Music Suggestions</h3>
      </div>

      {!currentSuggestion && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label>🎹 Instrument</Label>
                <Select value={instrument} onValueChange={setInstrument}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    {instruments.map(inst => (
                      <SelectItem key={inst.value} value={inst.value}>
                        {inst.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>🎶 Style/Genre</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>⚙️ Mode</Label>
                <Select value={selectedGenerationMode} onValueChange={setSelectedGenerationMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {generationModes.map(m => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>⏱️ Length in Bars</Label>
                <Select value={bars} onValueChange={setBars}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {barOptions.map(bar => (
                      <SelectItem key={bar.value} value={bar.value}>
                        {bar.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label>💭 Text Prompt (Optional)</Label>
            <Textarea
              placeholder="e.g., Suggest a dreamy melody in C major with 4 bars"
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              className="mt-1"
            />
          </div>
          
          {!hasExistingTracks && (
            <p className="text-sm text-muted-foreground mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <strong>Tip:</strong> AI suggestions can also build upon your existing tracks. 
              Upload some music via the "Upload New Track" button to try it out! 
              You can still generate new ideas from scratch right here.
            </p>
          )}

          <Button 
            onClick={handleGenerateSuggestion}
            disabled={isGenerating || !instrument || !style || !selectedGenerationMode || !user}
            className="w-full bg-music-400 hover:bg-music-500"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating AI Suggestion...
              </>
            ) : (
              <>
                <Music className="h-4 w-4 mr-2" />
                🎵 Get AI Suggestion
              </>
            )}
          </Button>
        </>
      )}

      {currentSuggestion && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">🎵 AI Generated Suggestion</h4>
            <div className="text-sm text-muted-foreground">
              {currentSuggestion.bars} bars • {currentSuggestion.instrument} • {currentSuggestion.style}
              {currentSuggestion.generation_mode && ` • ${currentSuggestion.generation_mode}`}
            </div>
          </div>

          <TrackPlayer
            trackUrl={currentSuggestion.audioUrl}
            title={currentSuggestion.title}
            duration={currentSuggestion.duration}
          />

          <div className="flex gap-2">
            <Button 
              onClick={handleAcceptSuggestion}
              disabled={isAccepting || !user}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  ✔️ Use in Project
                </>
              )}
            </Button>
            <Button 
              onClick={handleDiscardSuggestion}
              variant="outline"
              className="flex-1"
              disabled={isAccepting || !user}
            >
              <X className="h-4 w-4 mr-2" />
              ❌ Discard
            </Button>
          </div>
          <Button 
            variant="link" 
            className="w-full mt-2"
            onClick={() => {
                setCurrentSuggestion(null);
                setInstrument('');
                setStyle('');
                setSelectedGenerationMode('');
                setBars('4');
                setTextPrompt('');
            }}
            disabled={isGenerating || isAccepting}
            >
                Generate a different suggestion
            </Button>
        </div>
      )}
    </div>
  );
};
