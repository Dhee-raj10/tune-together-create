import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, instrument, style, mode, bars, textPrompt } = await req.json();

    console.log('Generating AI music suggestion:', {
      projectId,
      instrument,
      style,
      mode,
      bars,
      textPrompt
    });

    // Generate a more complex musical tone based on the parameters
    const audioData = generateMusicalTone(instrument, style, mode, parseInt(bars)); // Ensure bars is a number
    
    const audioUrl = `data:audio/wav;base64,${audioData}`;

    const suggestion = {
      id: crypto.randomUUID(),
      audioUrl: audioUrl,
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} ${mode} (${instrument})`,
      instrument,
      style,
      mode,
      bars: parseInt(bars),
      generatedAt: new Date().toISOString(),
      duration: parseInt(bars) * 2 // Simple calculation: 2 seconds per bar
    };

    console.log('AI suggestion generated:', suggestion);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestion,
        prompt: textPrompt || `Generate a ${style} ${mode} for ${instrument} with ${bars} bars`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-music-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI suggestion', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateMusicalTone(instrument: string, style: string, mode: string, bars: number): string {
  // Generate more realistic musical audio based on parameters
  const sampleRate = 44100;
  const duration = bars * 2; // 2 seconds per bar
  const samples = sampleRate * duration;
  
  // Get musical properties
  const { baseFreq, harmonics, rhythm } = getMusicalProperties(instrument, style, mode);
  
  // Create audio buffer
  const buffer = new ArrayBuffer(44 + samples * 2); // WAV header + 16-bit samples
  const view = new DataView(buffer);
  
  // WAV header
  writeWavHeader(view, samples, sampleRate);
  
  // Generate musical samples
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let value = 0;
    
    // Generate different musical patterns based on mode
    if (mode === 'melody') {
      value = generateMelody(t, baseFreq, harmonics, style);
    } else if (mode === 'chord') {
      value = generateChordProgression(t, baseFreq, harmonics, style);
    } else if (mode === 'beat') {
      value = generateBeat(t, rhythm, instrument);
    } else { // Covers 'continue' and any other modes as a fallback
      value = generateContinuation(t, baseFreq, harmonics, style);
    }
    
    // Apply musical envelope and dynamics
    value = applyEnvelope(value, t, duration, style);
    
    // Convert to 16-bit PCM
    const sample = Math.max(-1, Math.min(1, value));
    view.setInt16(44 + i * 2, sample * 0x7FFF, true);
  }
  
  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function getMusicalProperties(instrument: string, style: string, mode: string) {
  // Musical frequencies and properties
  const instrumentProps: { [key: string]: { baseFreq: number, harmonics: number[] } } = {
    'piano': { baseFreq: 440, harmonics: [1, 0.5, 0.25, 0.125] },
    'guitar': { baseFreq: 330, harmonics: [1, 0.6, 0.3, 0.15, 0.1] },
    'bass': { baseFreq: 110, harmonics: [1, 0.8, 0.4, 0.2] },
    'drums': { baseFreq: 60, harmonics: [1, 0.3, 0.1] },
    'synth': { baseFreq: 523, harmonics: [1, 0.7, 0.5, 0.3, 0.2] },
    'strings': { baseFreq: 440, harmonics: [1, 0.8, 0.6, 0.4, 0.2] }
  };
  
  const rhythmPatterns: { [key: string]: number[] } = {
    'lofi': [1, 0, 0.5, 0, 0.8, 0, 0.3, 0],
    'edm': [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5],
    'jazz': [1, 0, 0.7, 0.3, 0.5, 0, 0.8, 0.2],
    'rock': [1, 0, 0.8, 0, 1, 0, 0.6, 0],
    'pop': [1, 0.3, 0.6, 0.3, 0.8, 0.3, 0.5, 0.3],
    'classical': [1, 0.2, 0.4, 0.6, 0.8, 0.6, 0.4, 0.2]
  };
  
  const props = instrumentProps[instrument] || instrumentProps['piano'];
  let baseFreq = props.baseFreq;
  
  // Adjust frequency based on style
  if (style === 'jazz') baseFreq *= 0.8;
  else if (style === 'edm') baseFreq *= 1.2;
  else if (style === 'classical') baseFreq *= 0.9;
  else if (style === 'rock') baseFreq *= 1.1;
  
  return {
    baseFreq,
    harmonics: props.harmonics,
    rhythm: rhythmPatterns[style] || rhythmPatterns['pop']
  };
}

function generateMelody(t: number, baseFreq: number, harmonics: number[], style: string): number {
  // Create a simple melody with multiple notes
  const notePattern = [1, 1.125, 1.25, 1.5, 1.33, 1.125, 1]; // Major scale intervals
  const noteIndex = Math.floor((t * 2) % notePattern.length); // Change note every 0.5 seconds
  const freq = baseFreq * notePattern[noteIndex];
  
  let value = 0;
  for (let i = 0; i < harmonics.length; i++) {
    value += Math.sin(2 * Math.PI * freq * (i + 1) * t) * harmonics[i];
  }
  
  // Add some vibrato for realism
  const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 5 * t);
  return value * 0.3 * vibrato;
}

function generateChordProgression(t: number, baseFreq: number, harmonics: number[], style: string): number {
  // Create chord progressions (I-V-vi-IV)
  const chordPattern = [1, 1.5, 1.33, 1.125]; // Major chord progression
  const chordIndex = Math.floor((t * 0.5) % chordPattern.length); // Change chord every 2 seconds
  const rootFreq = baseFreq * chordPattern[chordIndex];
  
  // Generate triad (root, third, fifth)
  const chord = [rootFreq, rootFreq * 1.25, rootFreq * 1.5];
  let value = 0;
  
  for (const freq of chord) {
    for (let i = 0; i < harmonics.length; i++) {
      value += Math.sin(2 * Math.PI * freq * (i + 1) * t) * harmonics[i] * 0.33;
    }
  }
  
  return value * 0.2;
}

function generateBeat(t: number, rhythm: number[], instrument: string): number {
  const beatTime = t % 2; // 2-second pattern
  const beatIndex = Math.floor((beatTime / 2) * rhythm.length);
  const intensity = rhythm[beatIndex] || 0;
  
  if (instrument === 'drums') {
    // Generate percussive sounds
    const kickTime = beatTime % 0.5;
    if (kickTime < 0.1 && intensity > 0.5) {
      return intensity * Math.sin(2 * Math.PI * 60 * t) * Math.exp(-kickTime * 20);
    } else if (kickTime > 0.25 && kickTime < 0.35 && intensity > 0.3) {
      // Snare-like sound
      return intensity * 0.5 * (Math.random() - 0.5) * Math.exp(-(kickTime - 0.25) * 40);
    }
  }
  
  return 0;
}

function generateContinuation(t: number, baseFreq: number, harmonics: number[], style: string): number { // Fixed return type from 'value' to 'number'
  // Generate a continuation that could blend with existing music
  const modulation = Math.sin(2 * Math.PI * 0.1 * t); // Slow modulation
  let value = 0;
  
  for (let i = 0; i < harmonics.length; i++) {
    const freq = baseFreq * (i + 1) * (1 + modulation * 0.02);
    value += Math.sin(2 * Math.PI * freq * t) * harmonics[i];
  }
  
  return value * 0.25;
}

function applyEnvelope(value: number, t: number, duration: number, style: string): number {
  // Apply musical envelope (ADSR-like)
  const fadeTime = Math.min(0.1, duration * 0.05);
  
  // Fade in
  if (t < fadeTime) {
    value *= t / fadeTime;
  }
  
  // Fade out
  if (t > duration - fadeTime) {
    value *= (duration - t) / fadeTime;
  }
  
  // Add some style-specific dynamics
  if (style === 'lofi') {
    // Add some subtle filtering effect
    value *= (0.8 + 0.2 * Math.sin(2 * Math.PI * 0.5 * t));
  } else if (style === 'edm') {
    // Add some pumping effect
    value *= (0.7 + 0.3 * Math.abs(Math.sin(2 * Math.PI * 2 * t)));
  }
  
  return value;
}

function writeWavHeader(view: DataView, samples: number, sampleRate: number) {
  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples * 2, true);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
