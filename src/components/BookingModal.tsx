import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import useBookings from '@/hooks/useBookings';
import { supabase } from '@/lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  roomName: string;
  selectedRoomId: string;
  onBookingCreated: () => void;
}

export default function BookingModal({ isOpen, onClose, selectedDate, roomName, selectedRoomId, onBookingCreated }: BookingModalProps) {
  const { createBooking, loading } = useBookings(selectedRoomId);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserUid(user?.id || null);
    };
    fetchUser();
  }, []);

  if (!isOpen || !selectedDate) return null;

  const formattedDate = format(selectedDate, "MMMM dd, yyyy");

  const handleConfirmBooking = async () => {
    if (!currentUserUid) {
      alert('Você precisa estar logado para fazer uma reserva.');
      return;
    }

    try {
      await createBooking({
        room_id: selectedRoomId,
        user_id: currentUserUid,
        start_date: selectedDate.toISOString().split('T')[0],
        end_date: selectedDate.toISOString().split('T')[0], // Para reservas diárias, start_date e end_date são os mesmos
        type: 'daily_rental',
        status: 'confirmed',
        credits_earned: 0,
        credits_used: 0,
      });
      alert("Reserva confirmada com sucesso!");
      onBookingCreated(); // Notifica o componente pai para buscar as reservas atualizadas
      onClose();
    } catch (error) {
      console.error("Erro ao confirmar reserva:", error);
      // A mensagem de erro já é tratada dentro de useBookings, então apenas logamos aqui.
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">Confirmar Reserva</h2>
        <p className="mb-6 text-gray-700">
          Você quer reservar <span className="font-semibold">{roomName}</span> em <span className="font-semibold">{formattedDate}</span>?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirmBooking}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
} 