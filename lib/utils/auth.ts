import { createServerSupabaseClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/lib/types/database';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export async function getUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect(ROUTES.AUTH.SIGN_IN);
  }
  return user;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    redirect(ROUTES.HOME);
  }
  return profile;
}

export async function requireActiveUser() {
  const profile = await getProfile();
  if (!profile || profile.status !== 'active') {
    redirect(ROUTES.HOME);
  }
  return profile;
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin';
}

export function isActiveUser(profile: Profile | null): boolean {
  return profile?.status === 'active';
}

export function canBid(profile: Profile | null): boolean {
  return isActiveUser(profile) && profile?.role === 'buyer';
}