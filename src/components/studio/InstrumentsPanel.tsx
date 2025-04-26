
import { Button } from "@/components/ui/button";

export const InstrumentsPanel = () => {
  return (
    <div className="lg:col-span-3 border rounded-lg p-4 bg-card">
      <h2 className="font-bold mb-4">Instruments</h2>
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          🥁 Drum Machine
        </Button>
        <Button variant="outline" className="w-full justify-start">
          🎹 Piano
        </Button>
        <Button variant="outline" className="w-full justify-start">
          🎸 Guitar
        </Button>
        <Button variant="outline" className="w-full justify-start">
          🎺 Synth
        </Button>
      </div>
    </div>
  );
};
