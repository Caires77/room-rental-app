'use client';

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types'

export default function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, profile_picture_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfile(null);
      } else {
        setProfile(profileData as Profile);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      setLoadingProfile(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setProfile(null);
          } else {
            setProfile(profileData as Profile);
          }
        } else {
          setProfile(null);
        }
      } catch (err: any) {
        console.error('Error fetching session or profile:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
        setLoadingProfile(false);
      }
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from('profiles')
          .select('id, full_name, email, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) console.error('Error fetching profile on auth change:', error);
            setProfile(data as Profile || null);
          });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      // No longer creates the profile here!
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Profile creation is now handled by a database trigger!
      // Remove profile verification and insertion logic here.

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null);
      setProfile(null);
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithOtp = async (options: { phone: string; options?: { data?: { full_name?: string } } }) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp(options);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    user,
    profile,
    loading,
    loadingProfile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithOtp,
    fetchProfile,
  }
} 