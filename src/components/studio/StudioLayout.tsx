
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { ArrowLeft, Save } from "lucide-react"; // Import Save icon
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { DeleteProjectButton } from "@/components/studio/DeleteProjectButton";

interface StudioLayoutProps {
  children: React.ReactNode;
  title: string;
  mode: 'solo' | 'collaboration' | 'learning';
  onDelete: () => void;
  isDeleting: boolean;
  onSaveAndExit: () => void; // New prop for save and exit
}

export const StudioLayout = ({ 
  children, 
  title, 
  mode, 
  onDelete, 
  isDeleting,
  onSaveAndExit // Destructure new prop
}: StudioLayoutProps) => {
  const navigate = useNavigate(); // For programmatic navigation

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
                onClick={onSaveAndExit} // Use the passed handler
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Save & Exit
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

