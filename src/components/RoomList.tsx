import React from 'react';
import Link from 'next/link';
import { Room } from '@/types';

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  className?: string;
  selectedRoom: Room | null | undefined;
}

export default function RoomList({ rooms, selectedRoomId, onRoomSelect, className, selectedRoom }: RoomListProps) {
  return (
    <div className={`w-full lg:w-1/3 p-2 lg:p-8 bg-white shadow-lg ${className} flex flex-col`}>
      {/* Mobile Header/Selection */}
      <div className="lg:hidden mb-2 text-center">
        {selectedRoom ? (
          <h2 className="text-lg font-bold text-gray-900">{selectedRoom.name}</h2>
        ) : (
          <h2 className="text-lg font-bold text-gray-900">Choose a Room Below</h2>
        )}
      </div>
      
      {/* Room List - Horizontal scroll on mobile, vertical on desktop */}
      <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto space-x-2 lg:space-x-0 lg:space-y-2 pb-2 lg:pb-0 ">
        {rooms.length === 0 ? (
          <p className="text-gray-600 text-sm">No rooms available.</p>
        ) : (
          rooms.map(room => (
            <Link
              key={room.id}
              href={`/?roomId=${room.id}`}
              onClick={() => onRoomSelect(room.id)}
              className={`flex-shrink-0 w-48 lg:w-auto block p-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${selectedRoomId === room.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <h3 className="text-base font-semibold text-gray-800">{room.name}</h3>
              <p className="text-xs text-gray-600">{room.location}</p>
              <p className="text-xs text-gray-500 truncate">{room.description}</p>
              {room.assigned_monthly_tenant && (
                <p className="text-xs text-gray-500 mt-1">Monthly Tenant: {room.assigned_monthly_tenant.full_name}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 