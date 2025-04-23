
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <MusicIcon className="h-6 w-6 text-music-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-music-400 to-music-300 bg-clip-text text-transparent">
              TuneTogether
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-music-400">
            Home
          </Link>
          <Link to="/explore" className="text-sm font-medium transition-colors hover:text-music-400">
            Explore
          </Link>
          <Link to="/about" className="text-sm font-medium transition-colors hover:text-music-400">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-music-400 hover:bg-music-500">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function MusicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
