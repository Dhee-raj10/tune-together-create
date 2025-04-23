
import { Button } from "./ui/button";

interface ArtistCategoryProps {
  icon: React.ReactNode;
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ArtistCategory({ 
  icon, 
  label, 
  isSelected = false, 
  onClick 
}: ArtistCategoryProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`flex items-center gap-2 ${isSelected ? 'bg-music-400 hover:bg-music-500' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

export function DrumIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m14.5 2-3 3 3 3 3-3-3-3Z" />
      <path d="m7.5 9-3 3 3 3 3-3-3-3Z" />
      <path d="m14.5 16-3 3 3 3 3-3-3-3Z" />
    </svg>
  );
}

export function PianoIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18.5 8c-1.4 0-2.6-.8-3.2-2A6.5 6.5 0 0 0 2 8.5c0 3.6 2.9 6.5 6.5 6.5 1.4 0 2.6-.5 3.5-1.3" />
      <path d="M20 16c-1.4 0-2.6-.8-3.2-2a6.5 6.5 0 0 0-13.3 0A6.52 6.52 0 0 1 2 8.5" />
      <path d="M20 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
    </svg>
  );
}

export function GuitarIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m9 9 1.5 1.5" />
      <path d="m19.64 9.31-6.54 6.54a1.77 1.77 0 0 1-2.5 0 1.77 1.77 0 0 1 0-2.5l6.54-6.54a1.77 1.77 0 0 1 2.5 0 1.77 1.77 0 0 1 0 2.5Z" />
      <path d="m17 11 2-2" />
      <path d="M12 18.5A3.5 3.5 0 0 1 8.5 22a3.5 3.5 0 0 1-2.5-6c.9-.9 2.5-2.5 3-3s2.1.1 3 1l1.5 1.5c.9.9 1 2.1 0 3Z" />
    </svg>
  );
}

export function MicrophoneIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

export function HeadphonesIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

export function NotesIcon(props: React.SVGProps<SVGSVGElement>) {
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
