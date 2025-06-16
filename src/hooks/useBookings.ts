import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, Booking } from '@/types'; // Importar do arquivo centralizado

export default function useBookings(roomId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const currentUser = await supabase.auth.getUser();
      console.log('Current user UID during fetchBookings:', currentUser.data.user?.id);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          created_at,
          room_id,
          user_id,
          start_date,
          end_date,
          type,
          status,
          credits_earned,
          credits_used
        `)
        .eq('room_id', roomId)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        setError(error.message);
        setBookings([]);
      } else {
        console.log('Fetched bookings data (without profiles):', data);
        const fetchedBookings: Booking[] = data.map((booking: any) => ({
          ...booking,
          user: { id: booking.user_id, full_name: 'Loading...', email: '' } // Placeholder
        }));
        setBookings(fetchedBookings as Booking[]);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching bookings:', err);
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'user'>) => {
    let tempId: string = ''; // Declare tempId outside try block
    try {
      // Optimistic update: Add a temporary booking to the state immediately
      // This will make the calendar update visually right away.
      tempId = Math.random().toString(36).substring(7); // Assign value here
      const newBooking = {
        ...bookingData,
        id: tempId,
        created_at: new Date().toISOString(),
        user: { id: bookingData.user_id, full_name: 'You', email: '' }, // Placeholder user
        status: 'confirmed', // Ensure optimistic update matches DB behavior for daily rentals
      } as Booking;

      setBookings(prevBookings => [...prevBookings, newBooking]);

      // Call RPC
      const { data, error } = await supabase.rpc('create_daily_booking_and_update_credits', {
        p_room_id: bookingData.room_id,
        p_user_id: bookingData.user_id,
        p_start_date: bookingData.start_date,
        p_end_date: bookingData.end_date,
        p_type: bookingData.type,
        p_status: bookingData.status,
      }).single();

      if (error) throw error;

      // Update the optimistic booking with the actual ID returned from the RPC
      setBookings(prevBookings => prevBookings.map(b => 
        b.id === tempId ? { ...b, id: (data as { booking_id: string }).booking_id } : b
      ));

      return data as Booking;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      // If RPC fails, revert the optimistic update
      setBookings(prevBookings => prevBookings.filter(b => b.id !== tempId));
      
      if (err.message && err.message.includes('A booking already exists for this room and date range.')) {
        alert('This date is already booked or overlaps with an existing booking. Please choose another date.');
      } else {
        alert(`Failed to book room: ${err.message}`);
      }
      throw err;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) {
        throw new Error('User not authenticated.');
      }

      // Call RPC
      const { data, error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId,
      }).single();

      if (error) throw error;

      // Update the local state optimistically
      setBookings(prevBookings => prevBookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));

      // Não re-fetch aqui, o componente pai fará isso após o modal fechar
      // await fetchBookings(); 
      return data as Booking;
    } catch (err: any) {
      console.error('Error canceling booking:', err);
      alert(`Failed to cancel booking: ${err.message}`);
      // Revert optimistic update if there was an error
      // await fetchBookings(); // Fetch current state from DB
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) fetchBookings();
  }, [roomId]);

  return { bookings, loading, error, fetchBookings, createBooking, cancelBooking };
} 