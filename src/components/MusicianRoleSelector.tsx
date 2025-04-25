
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const MUSICIAN_ROLES = [
  { value: 'drummer', label: '🥁 Drumist', icon: '🥁' },
  { value: 'guitarist', label: '🎸 Guitarist', icon: '🎸' },
  { value: 'violinist', label: '🎻 Violinist', icon: '🎻' },
  { value: 'pianist', label: '🎹 Pianist', icon: '🎹' },
  { value: 'vocalist', label: '🎤 Vocalist', icon: '🎤' },
  { value: 'producer', label: '🎧 Producer', icon: '🎧' },
  { value: 'composer', label: '🎼 Composer', icon: '🎼' },
  { value: 'saxophonist', label: '🎷 Saxophonist', icon: '🎷' },
  { value: 'trumpeter', label: '🎺 Trumpeter', icon: '🎺' },
];

interface MusicianRoleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const MusicianRoleSelector: React.FC<MusicianRoleSelectorProps> = ({ 
  isOpen, 
  onClose, 
  userId 
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [otherRole, setOtherRole] = useState('');

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    // Combine selected roles, including 'other' if specified
    const finalRoles = [...selectedRoles];
    if (otherRole.trim()) {
      finalRoles.push(otherRole.trim());
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ roles: finalRoles })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Musician roles updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('Failed to update musician roles');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Who are you as a musician?</DialogTitle>
          <DialogDescription>
            Select one or more roles that describe your musical journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {MUSICIAN_ROLES.map(role => (
            <div key={role.value} className="flex items-center space-x-2">
              <Checkbox
                id={role.value}
                checked={selectedRoles.includes(role.value)}
                onCheckedChange={() => handleRoleToggle(role.value)}
              />
              <label
                htmlFor={role.value}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {role.icon} {role.label}
              </label>
            </div>
          ))}
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="other"
              checked={selectedRoles.includes('other')}
              onCheckedChange={() => handleRoleToggle('other')}
            />
            <label
              htmlFor="other"
              className="text-sm font-medium leading-none"
            >
              Other
            </label>
            {selectedRoles.includes('other') && (
              <input
                type="text"
                placeholder="Specify other role"
                value={otherRole}
                onChange={(e) => setOtherRole(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onClose()}>
            Skip
          </Button>
          <Button onClick={handleSubmit}>
            Save Roles
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
