import React from 'react';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="mb-6 text-gray-700">You need to log in or register to book this room.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Login
          </Link>
          <Link href="/register" className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
            Register
          </Link>
        </div>
        <button
          onClick={onClose}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Close
        </button>
      </div>
    </div>
  );
} 