
import React, { useState } from 'react';
import { ArtistCategory } from './ArtistCategory';
import { 
  DrumIcon, 
  PianoIcon, 
  GuitarIcon, 
  MicrophoneIcon, 
  HeadphonesIcon, 
  NotesIcon 
} from './ArtistCategory';

const ARTIST_TYPES = [
  { 
    icon: <DrumIcon className="h-4 w-4" />, 
    label: 'Drummer', 
    value: 'drummer' 
  },
  { 
    icon: <PianoIcon className="h-4 w-4" />, 
    label: 'Pianist', 
    value: 'pianist' 
  },
  { 
    icon: <GuitarIcon className="h-4 w-4" />, 
    label: 'Guitarist', 
    value: 'guitarist' 
  },
  { 
    icon: <MicrophoneIcon className="h-4 w-4" />, 
    label: 'Vocalist', 
    value: 'vocalist' 
  },
  { 
    icon: <HeadphonesIcon className="h-4 w-4" />, 
    label: 'Producer', 
    value: 'producer' 
  },
  { 
    icon: <NotesIcon className="h-4 w-4" />, 
    label: 'Composer', 
    value: 'composer' 
  }
];

interface CollaboratorSelectorProps {
  onSelectRoles: (roles: string[]) => void;
}

export const CollaboratorSelector: React.FC<CollaboratorSelectorProps> = ({ onSelectRoles }) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleToggle = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    
    setSelectedRoles(newRoles);
    onSelectRoles(newRoles);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {ARTIST_TYPES.map((artist) => (
          <ArtistCategory 
            key={artist.value}
            icon={artist.icon}
            label={artist.label}
            isSelected={selectedRoles.includes(artist.value)}
            onClick={() => handleRoleToggle(artist.value)}
          />
        ))}
      </div>
    </div>
  );
};
