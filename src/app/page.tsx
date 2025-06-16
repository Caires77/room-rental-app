'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSupabase from '@/hooks/useSupabase';
import useRooms from '@/hooks/useRooms';
import useBookings from '@/hooks/useBookings';
import RoomList from '@/components/RoomList';
import Calendar from '@/components/Calendar';
import BookingDetailsModal from '@/components/BookingDetailsModal';
import AuthModal from '@/components/AuthModal';
import BookingModal from '@/components/BookingModal';
import { Profile, Room, Booking } from '@/types';

export default function Home() {
  const router = useRouter();
  const { user } = useSupabase();
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<string | null>(null);

  // Get selected room object
  const selectedRoom: Room | null = selectedRoomId ? rooms.find(room => room.id === selectedRoomId) || null : null;

  // Fetch bookings for the selected room
  const { bookings, loading: bookingsLoading, error: bookingsError, createBooking, fetchBookings } = useBookings(selectedRoomId || '');

  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id); // Select the first room by default
    }
  }, [rooms, selectedRoomId]);

  const handleDayClick = (date: Date, booking: Booking | null) => {
    setSelectedDate(date);
    if (booking) {
      // If a booked date is clicked, show booking details
      setSelectedBookingDetails(booking.id);
    } else {
      // If an available date is clicked, initiate booking process
      if (!user) {
        setShowAuthModal(true); // User not logged in, show auth modal
      } else {
        setShowBookingModal(true); // User logged in, show booking confirmation modal
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoomId || !selectedDate || !user) return;

    try {
      await createBooking({
        room_id: selectedRoomId,
        user_id: user.id,
        start_date: selectedDate.toISOString().split('T')[0],
        end_date: selectedDate.toISOString().split('T')[0],
        type: 'daily_third_party_rental',
        status: 'pending', // Or 'confirmed' based on your workflow
        credits_earned: 0,
        credits_used: 0,
      });
      setShowBookingModal(false);
      setSelectedDate(null);
      alert('Booking request sent successfully!');
      // Refresh bookings after successful creation
      // useBookings hook automatically fetches after createBooking
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      alert(`Failed to book room: ${error.message}`);
    }
  };

  if (roomsLoading) return <div className="text-center py-8">Loading rooms...</div>;
  if (roomsError) return <div className="text-center py-8 text-red-500">Error loading rooms: {roomsError}</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">

      {/* RoomList (now includes selection header for mobile) */}
      <RoomList
        rooms={rooms as Room[]}
        selectedRoomId={selectedRoomId}
        onRoomSelect={setSelectedRoomId}
        className="lg:order-last"
        selectedRoom={selectedRoom as Room | null}
      />

      {/* Calendar Section (only visible if room selected) */}
      {selectedRoom ? (
        <div className="flex-1 p-2 lg:p-8 overflow-y-auto lg:order-first flex flex-col min-h-0">
          {/* Location and description below selected room name */}
          <p className="text-gray-600 mb-2 px-2 lg:px-0">
            {selectedRoom.description}
          </p>
          <Calendar
            bookings={bookings}
            loading={bookingsLoading}
            onDayClick={handleDayClick}
          />
        </div>
      ) : (
        <div className="flex-1 p-2 lg:p-8 overflow-y-auto lg:order-first flex items-center justify-center text-gray-600 text-center">
          <p>Please select a room to view its calendar.</p>
        </div>
      )}

      {/* Modals */}
      <BookingDetailsModal
        bookingId={selectedBookingDetails}
        onClose={() => {
          setSelectedBookingDetails(null);
        }}
        bookings={bookings}
        onBookingCanceled={() => {
          setSelectedBookingDetails(null);
          fetchBookings();
        }}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedDate={selectedDate}
        roomName={selectedRoom?.name || 'Selected Room'}
        selectedRoomId={selectedRoom?.id || ''}
        onBookingCreated={() => {
          setShowBookingModal(false);
          fetchBookings();
        }}
      />
    </div>
  );
}
