
import { Button } from "@/components/ui/button";

export const MixerPanel = () => {
  return (
    <div className="lg:col-span-3 border rounded-lg p-4 bg-card">
      <h2 className="font-bold mb-4">Mixer</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm">Master Volume</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="80"
            className="w-full" 
          />
        </div>
        <div>
          <label className="text-sm">Tempo (BPM)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              min="60" 
              max="200"
              defaultValue="120"
              className="w-full p-2 text-sm border rounded" 
            />
          </div>
        </div>
        <Button className="w-full mt-4 bg-music-400 hover:bg-music-500">
          Save Project
        </Button>
      </div>
    </div>
  );
};
