
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MixerPanelProps {
  projectId: string;
  initialMasterVolume?: number | null;
  initialTempo?: number | null;
}

export const MixerPanel = ({ projectId, initialMasterVolume, initialTempo }: MixerPanelProps) => {
  const [masterVolume, setMasterVolume] = useState(initialMasterVolume ?? 80);
  const [tempo, setTempo] = useState(initialTempo ?? 120);
  const { updateProjectSettings, isLoading } = useProjects();

  useEffect(() => {
    setMasterVolume(initialMasterVolume ?? 80);
  }, [initialMasterVolume]);

  useEffect(() => {
    setTempo(initialTempo ?? 120);
  }, [initialTempo]);

  const handleSaveProject = async () => {
    if (!projectId) {
      toast.error("Project ID is missing. Cannot save settings.");
      return;
    }
    const success = await updateProjectSettings(projectId, {
      master_volume: masterVolume,
      tempo: tempo,
    });
    // Optionally, handle success/failure further if needed
  };

  return (
    <div className="lg:col-span-3 border rounded-lg p-4 bg-card">
      <h2 className="font-bold mb-4">Mixer</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="masterVolume" className="text-sm">Master Volume</label>
          <input
            id="masterVolume"
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-center">{masterVolume}</p>
        </div>
        <div>
          <label htmlFor="tempo" className="text-sm">Tempo (BPM)</label>
          <div className="flex items-center gap-2">
            <input
              id="tempo"
              type="number"
              min="40"
              max="240"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full p-2 text-sm border rounded"
            />
          </div>
        </div>
        <Button 
          className="w-full mt-4 bg-music-400 hover:bg-music-500"
          onClick={handleSaveProject}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </div>
  );
};
