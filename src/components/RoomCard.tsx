import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import RoomFormModal from '@/components/RoomFormModal';
import { Room, Profile, Booking } from '@/types';
import Calendar from './Calendar';
import BookingDetailsModal from './BookingDetailsModal';
import useBookings from '@/hooks/useBookings';

interface RoomCardProps {
  room: Room;
  onRoomUpdated: () => void;
  allProfiles: Profile[];
}

export default function RoomCard({ room, onRoomUpdated, allProfiles }: RoomCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { bookings, loading, fetchBookings } = useBookings(room.id);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the room "${room.name}"?`)) {
      try {
        const { error } = await supabase.rpc('delete_room_and_related_data', {
          p_room_id: room.id
        });
        if (error) throw error;
        
        onRoomUpdated();
      } catch (error: any) {
        console.error('Error deleting room:', error);
        alert(`Failed to delete room: ${error.message}`);
      }
    }
  };

  const handleDayClick = (date: Date, booking: Booking | null) => {
    if (booking) {
      setSelectedBookingId(booking.id);
    }
  };

  const handleBookingCanceled = () => {
    fetchBookings();
    setSelectedBookingId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
      <p className="text-gray-600 mb-1">{room.location}</p>
      <p className="text-gray-500 text-sm flex-grow mb-4">{room.description}</p>
      {room.assigned_monthly_tenant && (
        <p className="text-sm text-gray-700 mb-2">
          Assigned Monthly Tenant: <span className="font-medium">{room.assigned_monthly_tenant.full_name}</span>
        </p>
      )}
      <div className="mt-auto flex justify-end space-x-2">
        <button
          onClick={() => setShowEditModal(true)}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Delete
        </button>
      </div>

      <RoomFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onRoomCreated={onRoomUpdated}
        ownerId={room.owner_id}
        editingRoom={room}
        allProfiles={allProfiles}
      />

      <div className="mt-4">
        <button
          className="mb-2 text-blue-600 underline"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        {showDetails && (
          <>
            <Calendar
              bookings={bookings}
              loading={loading}
              onDayClick={handleDayClick}
            />
            <BookingDetailsModal
              bookingId={selectedBookingId}
              bookings={bookings}
              onClose={() => setSelectedBookingId(null)}
              onBookingCanceled={handleBookingCanceled}
            />
          </>
        )}
      </div>
    </div>
  );
} 