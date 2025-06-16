import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import useBookings from '@/hooks/useBookings';
import useSupabase from '@/hooks/useSupabase';
import { Profile, Booking } from '@/types';

interface BookingDetailsModalProps {
  bookingId: string | null;
  bookings: Booking[];
  onClose: () => void;
  onBookingCanceled: () => void;
}

export default function BookingDetailsModal({ bookingId, bookings, onClose, onBookingCanceled }: BookingDetailsModalProps) {
  const { user, profile } = useSupabase();
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const booking = bookingId ? bookings.find(b => b.id === bookingId) : null;
  const { cancelBooking, loading: isCanceling } = useBookings(booking?.room_id || '');

  useEffect(() => {
    setCurrentUserUid(user?.id || null);
  }, [user]);

  if (!booking) return null;

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "MMMM dd, yyyy", { locale: enUS });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'monthly_tenant_booking':
        return 'Monthly Tenant Booking';
      case 'daily_third_party_rental':
        return 'Daily Third-Party Rental';
      case 'credit_earned_from_third_party_booking':
        return 'Credit Earned (Internal)';
      default:
        return type;
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        console.log('Attempting to cancel booking with ID:', booking.id);
        await cancelBooking(booking.id);
        alert("Booking cancelled successfully!");
        onClose();
        onBookingCanceled();
      } catch (error) {
        console.error("Failed to cancel booking:", error);
      }
    }
  };

  const isOwner = profile?.role === 'owner';
  console.log('DEBUG: profile', profile);
  console.log('DEBUG: isOwner', isOwner);
  console.log('DEBUG: currentUserUid', currentUserUid);
  console.log('DEBUG: booking.user_id', booking.user_id);
  console.log('DEBUG: booking.status', booking.status);
  const showCancelButton = booking.status === 'confirmed' &&
                           (isOwner || (currentUserUid && booking.user_id === currentUserUid));
  console.log('DEBUG: showCancelButton final', showCancelButton);
  const isCancellableByDate = parseISO(booking.start_date) > new Date(new Date().setDate(new Date().getDate() + 1));
  const isAlreadyCancelled = booking.status === 'cancelled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Booking Details</h2>
        
        <div className="space-y-3">
          <p>
            <span className="font-semibold">Type:</span>{' '}
            <span className={booking.type === 'monthly_tenant_booking' ? 'text-red-600' : 'text-yellow-600'}>
              {getTypeText(booking.type)}
            </span>
          </p>
          
          <p>
            <span className="font-semibold">Status:</span>{' '}
            <span className={getStatusColor(booking.status)}>
              {booking.status === 'confirmed' ? 'Confirmed' :
               booking.status === 'pending' ? 'Pending' : 'Cancelled'}
            </span>
          </p>

          <p>
            <span className="font-semibold">Tenant:</span>{' '}
            {booking.user?.full_name} ({booking.user?.email})
          </p>

          <p>
            <span className="font-semibold">From:</span>{' '}
            {formatDate(booking.start_date)}
          </p>

          <p>
            <span className="font-semibold">To:</span>{' '}
            {formatDate(booking.end_date)}
          </p>

          {booking.type === 'monthly_tenant_booking' && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="font-semibold mb-2">Credits:</p>
              <p>Earned: {booking.credits_earned}</p>
              <p>Used: {booking.credits_used}</p>
              <p>Available: {booking.credits_earned - booking.credits_used}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          {showCancelButton && !isAlreadyCancelled && (
            <button
              onClick={handleCancelBooking}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={isCanceling}
            >
              {isCanceling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
          {isAlreadyCancelled && (
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
              disabled
            >
              Cancelled
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 