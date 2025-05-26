
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Hourglass } from "lucide-react"; // Import Hourglass icon
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { DeleteProjectButton } from "@/components/studio/DeleteProjectButton";

interface StudioLayoutProps {
  children: React.ReactNode;
  title: string;
  mode: 'solo' | 'collaboration' | 'learning';
  onDelete: () => void;
  isDeleting: boolean;
  onRequestSaveAndExit: () => void; // Renamed from onSaveAndExit
  isRequestingExit: boolean; // New prop to indicate pending request or current request process
  canExitImmediately: boolean; // New prop to indicate if user can exit without request
}

export const StudioLayout = ({ 
  children, 
  title, 
  mode, 
  onDelete, 
  isDeleting,
  onRequestSaveAndExit, // Use new prop
  isRequestingExit,     // Use new prop
  canExitImmediately    // Use new prop
}: StudioLayoutProps) => {
  const navigate = useNavigate();

  const getSaveButtonText = () => {
    if (canExitImmediately) return "Save & Exit";
    if (isRequestingExit) return "Request Pending...";
    return "Request Save & Exit";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {mode} mode
              </div>
              <Button 
                variant="outline" 
                onClick={onRequestSaveAndExit}
                disabled={!canExitImmediately && isRequestingExit} // Disable if request is pending and can't exit immediately
                className="flex items-center gap-2"
              >
                {canExitImmediately ? <Save size={16} /> : (isRequestingExit ? <Hourglass size={16} className="animate-spin" /> : <Save size={16} />) }
                {getSaveButtonText()}
              </Button>
              <DeleteProjectButton onDelete={onDelete} isDeleting={isDeleting} />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};
