
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

    // Generate a simple audio tone based on the parameters
    // This creates a simple sine wave tone that matches the selected style/instrument
    const audioData = generateSimpleAudioTone(instrument, style, mode, bars);
    
    // In a real implementation, you would:
    // 1. Call a music AI service like MusicLM, MuseNet, etc.
    // 2. Upload the generated audio to Supabase Storage
    // 3. Return the storage URL
    
    // For now, we'll create a data URL with the generated audio
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
      duration: bars * 2 // Simple calculation: 2 seconds per bar
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

function generateSimpleAudioTone(instrument: string, style: string, mode: string, bars: number): string {
  // Generate a simple sine wave audio based on parameters
  const sampleRate = 44100;
  const duration = bars * 2; // 2 seconds per bar
  const samples = sampleRate * duration;
  
  // Different frequencies for different instruments
  const baseFreq = getBaseFrequency(instrument, style);
  
  // Create audio buffer
  const buffer = new ArrayBuffer(44 + samples * 2); // WAV header + 16-bit samples
  const view = new DataView(buffer);
  
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
  
  // Generate audio samples
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let value = 0;
    
    // Different wave patterns for different modes
    if (mode === 'melody') {
      value = Math.sin(2 * Math.PI * baseFreq * t) * 0.3;
    } else if (mode === 'chord') {
      value = (Math.sin(2 * Math.PI * baseFreq * t) + 
               Math.sin(2 * Math.PI * baseFreq * 1.25 * t) + 
               Math.sin(2 * Math.PI * baseFreq * 1.5 * t)) * 0.1;
    } else if (mode === 'beat') {
      value = (t % 0.5 < 0.1) ? Math.sin(2 * Math.PI * 60 * t) * 0.5 : 0;
    } else {
      value = Math.sin(2 * Math.PI * baseFreq * t) * 0.2;
    }
    
    // Apply fade in/out
    const fadeTime = 0.1;
    if (t < fadeTime) value *= t / fadeTime;
    if (t > duration - fadeTime) value *= (duration - t) / fadeTime;
    
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

function getBaseFrequency(instrument: string, style: string): number {
  const frequencies: { [key: string]: number } = {
    'piano': 440,
    'guitar': 330,
    'bass': 110,
    'drums': 60,
    'synth': 523,
    'strings': 440
  };
  
  let freq = frequencies[instrument] || 440;
  
  // Adjust frequency based on style
  if (style === 'jazz') freq *= 0.8;
  else if (style === 'edm') freq *= 1.2;
  else if (style === 'classical') freq *= 0.9;
  
  return freq;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
