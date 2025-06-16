export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role?: 'owner' | 'tenant' | null;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  description: string;
  owner_id: string;
  assigned_monthly_tenant_id: string | null;
  assigned_monthly_tenant?: Profile | null; // Allow null here
  created_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  type: 'monthly_tenant_booking' | 'daily_third_party_rental' | 'credit_earned_from_third_party_booking';
  status: 'confirmed' | 'pending' | 'cancelled' | 'credit_generated';
  credits_earned: number;
  credits_used: number;
  created_at: string;
  user?: Profile; // Can be optional in some initial fetches
} 