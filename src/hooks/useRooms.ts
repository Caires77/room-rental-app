import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, Room } from '@/types';

interface UseRoomsResult {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
}

export default function useRooms(ownerId?: string): UseRoomsResult {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('rooms')
        .select(
          `
          id,
          name,
          location,
          description,
          owner_id,
          assigned_monthly_tenant_id,
          created_at,
          assigned_monthly_tenant:profiles(id, full_name, email)
        `
        );

      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching rooms:", error);
        setError(error.message);
        setRooms([]);
      } else {
        const mappedRooms: Room[] = data.map((roomData: any) => ({
          id: roomData.id,
          name: roomData.name,
          location: roomData.location,
          description: roomData.description,
          owner_id: roomData.owner_id,
          assigned_monthly_tenant_id: roomData.assigned_monthly_tenant_id,
          created_at: roomData.created_at,
          assigned_monthly_tenant: roomData.assigned_monthly_tenant
            ? {
                id: roomData.assigned_monthly_tenant.id,
                full_name: roomData.assigned_monthly_tenant.full_name,
                email: roomData.assigned_monthly_tenant.email,
              }
            : null,
        }));
        setRooms(mappedRooms);
      }
    } catch (err: any) {
      console.error("Unexpected error fetching rooms:", err);
      setError(err.message || "An unexpected error occurred");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, loading, error, fetchRooms };
} 