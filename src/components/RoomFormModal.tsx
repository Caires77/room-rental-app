import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, Room } from '@/types'; // Importar do arquivo centralizado

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  onRoomCreated: () => void;
  ownerId: string; // ID do admin logado (Marcelo)
  allProfiles: Profile[]; // Lista de todos os perfis para vincular
  editingRoom?: Room | null; // Novo: Sala a ser editada (opcional)
}

export default function RoomFormModal({ open, onClose, onRoomCreated, ownerId, allProfiles, editingRoom }: RoomFormModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [assignedMonthlyTenantId, setAssignedMonthlyTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingRoom) {
        setName(editingRoom.name);
        setLocation(editingRoom.location);
        setDescription(editingRoom.description);
        setAssignedMonthlyTenantId(editingRoom.assigned_monthly_tenant?.id || null);
      } else {
        setName('');
        setLocation('');
        setDescription('');
        setAssignedMonthlyTenantId(null);
      }
    }
  }, [open, editingRoom]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const roomData = {
      name,
      location,
      description,
      owner_id: ownerId,
      assigned_monthly_tenant_id: assignedMonthlyTenantId,
    };

    try {
      if (editingRoom) {
        // Atualizar sala existente
        const { error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', editingRoom.id);
        if (error) throw error;
      } else {
        // Criar nova sala
        const { error } = await supabase.from('rooms').insert(roomData);
        if (error) throw error;
      }
      onRoomCreated();
      onClose();
    } catch (error: any) {
      console.error(`Error ${editingRoom ? 'updating' : 'creating'} room:`, error);
      alert(`Failed to ${editingRoom ? 'update' : 'create'} room: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{editingRoom ? 'Edit Room' : 'Create Room'}</h2>
        <div className="mb-2">
          <label htmlFor="roomName" className="block mb-1">Room Name</label>
          <input id="roomName" className="w-full border rounded px-2 py-1" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label htmlFor="location" className="block mb-1">Location</label>
          <input id="location" className="w-full border rounded px-2 py-1" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea id="description" className="w-full border rounded px-2 py-1" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="mb-2"> 
          <label htmlFor="assignedTenant" className="block mb-1">Assigned Monthly Tenant</label>
          <select
            id="assignedTenant"
            className="w-full border rounded px-2 py-1"
            value={assignedMonthlyTenantId || ''}
            onChange={e => setAssignedMonthlyTenantId(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">None</option> 
            {allProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name || profile.email}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {loading ? (editingRoom ? 'Saving...' : 'Creating...') : (editingRoom ? 'Save Changes' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
} 