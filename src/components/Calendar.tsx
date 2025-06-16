import React from 'react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Profile, Booking } from '@/types';

interface CalendarProps {
  bookings: Booking[];
  loading: boolean;
  onDayClick: (date: Date, booking: Booking | null) => void;
}

export default function Calendar({ bookings, loading, onDayClick }: CalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Function to check if a date is in the past
  function isPastDate(day: number): boolean {
    const dateToCheck = new Date(year, month, day);
    // Set hours, minutes, seconds, milliseconds of today to 0 for accurate day comparison
    const todayStartOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateToCheck < todayStartOfDay;
  }

  // Generate an array of days in the month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Function to check if the day is booked and what type of booking it is
  function getBookingForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const currentDate = parseISO(dateStr);
    return bookings.find((b) => {
      const startDate = parseISO(b.start_date);
      const endDate = parseISO(b.end_date);
      // Only consider confirmed or pending bookings as "occupied", ignoring credit records
      return (currentDate >= startDate && currentDate <= endDate) && 
             (b.status === 'confirmed' || b.status === 'pending') &&
             b.type !== 'credit_earned_from_third_party_booking';
    });
  }

  // Function to determine the color of the day
  function getDayColor(day: number) {
    if (isPastDate(day)) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed'; // Gray out past dates
    }
    const booking = getBookingForDay(day);
    if (!booking) return 'bg-green-200'; // Available (green)

    if (booking.type === 'monthly_tenant_booking') {
      return 'bg-red-400'; // Monthly Tenant Booking (red)
    } else if (booking.type === 'daily_third_party_rental') {
      return 'bg-yellow-400'; // Third-Party Daily Rental (yellow)
    } else {
      return 'bg-gray-400'; // Fallback for unknown types (gray)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        {format(today, 'MMMM yyyy', { locale: enUS })}
      </h2>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs text-center font-bold">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const currentDayDate = parseISO(dateStr);
          const booking = getBookingForDay(day);
          const dayIsPast = isPastDate(day);
          return (
            <button
              key={day}
              className={`h-8 w-full rounded ${getDayColor(day)} text-gray-800 ${dayIsPast ? '' : 'hover:opacity-80'}`}
              onClick={() => !dayIsPast && onDayClick(currentDayDate, booking || null)}
              disabled={dayIsPast}
            >
              {day}
            </button>
          );
        })}
      </div>
      {loading && <div className="mt-2 text-sm">Loading bookings...</div>}
      <div className="mt-2 flex gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
          <span className="text-sm">Reserved (Monthly)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
          <span className="text-sm">Reserved (Daily)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
          <span className="text-sm">Available</span>
        </div>
      </div>
    </div>
  );
} 