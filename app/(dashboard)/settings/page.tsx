import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, api_key')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/dashboard');
  }

  return (
    <SettingsClient
      profile={{
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name || '',
        bio: profile.bio || '',
        apiKey: profile.api_key,
      }}
    />
  );
}
