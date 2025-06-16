'use client';

import Link from 'next/link'
import useSupabase from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { user, profile, signOut, loading } = useSupabase();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    console.log('Attempting to sign out...');
    await signOut();
    router.push('/'); // Redireciona para a página inicial
    // Força um recarregamento completo para garantir a redefinição do estado no cliente, especialmente em dispositivos móveis
    window.location.reload(); 
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Skin de La Mer</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              // Opcional: Mostrar um spinner ou um espaço vazio enquanto carrega
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none flex items-center"
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  {user?.email || user?.phone} {/* Display email or phone */}
                  {/* Ícone de seta para indicar dropdown */}
                  <svg className={`ml-2 h-4 w-4 transform transition-transform ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {profile?.role === 'owner' && (
                      <>
                        <Link href="/dashboard" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Manage Rooms
                        </Link>
                        <Link href="/admin/users" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          View All Users
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 