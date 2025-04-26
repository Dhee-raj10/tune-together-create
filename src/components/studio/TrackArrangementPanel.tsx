
import { Button } from "@/components/ui/button";

export const TrackArrangementPanel = () => {
  return (
    <div className="lg:col-span-6 border rounded-lg p-4 bg-card min-h-[400px]">
      <h2 className="font-bold mb-4">Tracks</h2>
      <div className="bg-muted/50 rounded-lg p-2 h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Track arrangement area</p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div>
          <Button variant="outline" size="sm">
            Add Track
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            ▶️ Play
          </Button>
          <Button variant="outline" size="sm">
            ⏹️ Stop
          </Button>
          <Button variant="outline" size="sm">
            🔄 Loop
          </Button>
        </div>
      </div>
    </div>
  );
};
