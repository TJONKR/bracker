import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardNav } from './nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="shell">
      <DashboardNav
        username={profile?.username || ''}
        displayName={profile?.display_name || profile?.username || ''}
        avatarUrl={profile?.avatar_url}
      />
      {children}
    </div>
  );
}
