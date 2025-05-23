
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Music, Check, X, Loader2 } from 'lucide-react';
import { TrackPlayer } from './TrackPlayer';

interface AISuggestion {
  id: string;
  audioUrl: string;
  title: string;
  instrument: string;
  style: string;
  mode: string;
  bars: number;
  duration?: number;
}

interface AISuggestionPanelProps {
  projectId: string;
  onSuggestionAccepted: () => void;
}

export const AISuggestionPanel = ({ projectId, onSuggestionAccepted }: AISuggestionPanelProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);
  const [instrument, setInstrument] = useState('');
  const [style, setStyle] = useState('');
  const [bars, setBars] = useState('4');
  const [mode, setMode] = useState('');
  const [textPrompt, setTextPrompt] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

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

  const modes = [
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
    if (!instrument || !style || !mode) {
      toast.error('Please select instrument, style, and mode');
      return;
    }

    setIsGenerating(true);
    setCurrentSuggestion(null);
    
    try {
      console.log('Calling AI suggestion function...');
      const { data, error } = await supabase.functions.invoke('generate-music-ai', {
        body: {
          projectId,
          instrument,
          style,
          mode,
          bars: parseInt(bars),
          textPrompt
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('AI suggestion response:', data);
      
      if (data && data.suggestion) {
        setCurrentSuggestion(data.suggestion);
        toast.success('🎵 AI suggestion generated successfully!');
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast.error('Failed to generate AI suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!currentSuggestion) return;

    setIsAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to accept suggestions');
        return;
      }

      // Create a more descriptive title
      const suggestionTitle = `AI ${currentSuggestion.title}`;
      
      console.log('Adding AI suggestion to tracks:', {
        project_id: projectId,
        title: suggestionTitle,
        file_url: currentSuggestion.audioUrl,
        user_id: user.id,
        file_type: 'audio/wav',
        duration: currentSuggestion.duration || (currentSuggestion.bars * 2)
      });

      const { error } = await supabase.from('tracks').insert({
        project_id: projectId,
        title: suggestionTitle,
        file_url: currentSuggestion.audioUrl,
        user_id: user.id,
        file_type: 'audio/wav',
        duration: currentSuggestion.duration || (currentSuggestion.bars * 2)
      });

      if (error) {
        console.error('Error adding suggestion to tracks:', error);
        throw error;
      }

      toast.success('🎵 AI suggestion added to your project!');
      setCurrentSuggestion(null);
      onSuggestionAccepted();
      
      // Reset form
      setInstrument('');
      setStyle('');
      setMode('');
      setBars('4');
      setTextPrompt('');
      
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      toast.error('Failed to add suggestion to project');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDiscardSuggestion = () => {
    setCurrentSuggestion(null);
    toast.info('Suggestion discarded');
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5 text-music-400" />
        <h3 className="text-lg font-semibold">🎵 AI Music Suggestions</h3>
      </div>

      {/* Configuration Panel */}
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
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {modes.map(m => (
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

      {/* Text Prompt */}
      <div>
        <Label>💭 Text Prompt (Optional)</Label>
        <Textarea
          placeholder="e.g., Suggest a dreamy melody in C major with 4 bars"
          value={textPrompt}
          onChange={(e) => setTextPrompt(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Generate Button */}
      <Button 
        onClick={handleGenerateSuggestion}
        disabled={isGenerating || !instrument || !style || !mode}
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

      {/* Current Suggestion Display */}
      {currentSuggestion && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">🎵 AI Generated Suggestion</h4>
            <div className="text-sm text-muted-foreground">
              {currentSuggestion.bars} bars • {currentSuggestion.instrument} • {currentSuggestion.style}
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
              disabled={isAccepting}
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
              disabled={isAccepting}
            >
              <X className="h-4 w-4 mr-2" />
              ❌ Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
