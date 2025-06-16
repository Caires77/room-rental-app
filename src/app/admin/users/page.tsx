'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import useSupabase from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';

interface UserWithDetails extends Profile {
  phone?: string;
  total_credits_earned?: number;
  total_credits_used?: number;
  available_credits?: number;
}

interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user } = useSupabase();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch authentication information using RPC function
      const { data: authUsers, error: authError } = await supabase
        .rpc('list_users');

      if (authError) throw authError;

      // Fetch credits for each user
      const usersWithDetails = await Promise.all(profiles.map(async (profile) => {
        const authUser = authUsers?.find((u: AuthUser) => u.id === profile.id);
        
        // Fetch user credits
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            credits_earned,
            credits_used,
            type,
            status
          `)
          .eq('user_id', profile.id);

        if (appointmentsError) throw appointmentsError;

        const totalCreditsEarned = appointments?.filter(app => 
          app.type === 'credit_earned_from_third_party_booking' && app.status === 'credit_generated'
        ).reduce((sum: number, app: { credits_earned?: number }) => 
          sum + (app.credits_earned || 0), 0) || 0;
        
        const totalCreditsUsed = appointments?.filter(app =>
          app.type === 'monthly_tenant_booking' && app.status === 'confirmed'
        ).reduce((sum: number, app: { credits_used?: number }) => 
          sum + (app.credits_used || 0), 0) || 0;

        return {
          ...profile,
          phone: authUser?.phone,
          total_credits_earned: totalCreditsEarned,
          total_credits_used: totalCreditsUsed,
          available_credits: totalCreditsEarned - totalCreditsUsed
        };
      }));

      setUsers(usersWithDetails);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Call RPC function to delete user and profile
      const { error } = await supabase.rpc('delete_user_and_profile', {
        p_target_user_id: userId
      });

      if (error) throw error;

      // Update user list
      await fetchUsers();
      alert('User deleted successfully!');
    } catch (err: any) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const { error } = await supabase
        .rpc('update_user_password', {
          target_user_id: selectedUser.id,
          new_password: newPassword
        });

      if (error) throw error;

      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      alert('Password changed successfully!');
    } catch (err: any) {
      alert(`Error changing password: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8">Loading users...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/')}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{user.full_name}</h2>
            <div className="text-sm text-gray-600 mb-4">
              {user.email && <div className="flex items-center mb-1"><span className="font-medium w-20">Email:</span> {user.email}</div>}
              {user.phone && <div className="flex items-center mb-1"><span className="font-medium w-20">Phone:</span> {user.phone}</div>}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium w-20">Role:</span> {user.role || 'Not defined'}
            </div>
            <div className="text-sm text-gray-600 mb-6">
              <span className="font-medium w-20">Credits Earned:</span> {user.total_credits_earned || 0}
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowPasswordModal(true);
                }}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            <p className="mb-4">Changing password for: {selectedUser.full_name}</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 