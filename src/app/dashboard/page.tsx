'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSupabase from '@/hooks/useSupabase';
import useRooms from '@/hooks/useRooms';
import RoomCard from '@/components/RoomCard';
import RoomFormModal from '@/components/RoomFormModal';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export default function DashboardPage() {
  const { user, signOut, loading: loadingUserSession } = useSupabase();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { rooms, loading: loadingRooms, fetchRooms } = useRooms(user?.id);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).supabase = supabase;
      console.log('Supabase client exposed globally for debugging.');
    }
  }, []);

  useEffect(() => {
    console.log('Dashboard useEffect triggered. User:', user, 'loadingUserSession:', loadingUserSession);

    if (loadingUserSession) {
      console.log('User session still loading...');
      return;
    }

    async function fetchProfileAndCheckRole() {
      if (!user) {
        console.log('No user found after session load, redirecting to /');
        router.replace('/');
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      try {
        console.log('Attempting to fetch profile for user ID:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .limit(1);

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
          router.replace('/');
        } else {
          const fetchedProfile = data && data.length > 0 ? data[0] : null;
          console.log('Fetched profile data:', fetchedProfile);
          setProfile(fetchedProfile);

          if (!fetchedProfile || fetchedProfile.role !== 'owner') {
            console.log('Redirecting: Role is not owner or no data.', fetchedProfile);
            router.replace('/');
          } else {
            console.log('Access granted. Role is owner.');
          }
        }
      } catch (err) {
        console.error('Unexpected error during profile fetch:', err);
        setProfile(null);
        router.replace('/');
      } finally {
        setIsProfileLoading(false);
      }
    }

    fetchProfileAndCheckRole();
  }, [user, router, loadingUserSession]);

  useEffect(() => {
    async function fetchAllProfiles() {
      setLoadingProfiles(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (error) {
        console.error('Error fetching all profiles:', error);
      } else {
        setAllProfiles(data || []);
      }
      setLoadingProfiles(false);
    }

    if (user && profile && profile.role === 'owner') {
      fetchAllProfiles();
    }
  }, [user, profile]);

  if (loadingUserSession || isProfileLoading || !user || !profile || loadingProfiles) {
    console.log('Rendering loading state. User:', user, 'Profile:', profile, 'isProfileLoading:', isProfileLoading, 'loadingUserSession:', loadingUserSession, 'loadingProfiles:', loadingProfiles);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p>Loading dashboard...</p>
        </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Back to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold">Your Rooms</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Room
        </button>
      </div>
      {loadingRooms ? (
        <div>Loading rooms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room: any) => (
            <RoomCard key={room.id} room={room} onRoomUpdated={fetchRooms} allProfiles={allProfiles} />
          ))}
        </div>
      )}
      <RoomFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onRoomCreated={fetchRooms}
        ownerId={user.id}
        allProfiles={allProfiles}
      />
    </main>
  );
} 