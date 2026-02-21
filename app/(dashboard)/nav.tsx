'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function DashboardNav({
  username,
  displayName,
  avatarUrl,
}: {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="topbar">
      <a href="/dashboard" style={{ fontWeight: 800, fontSize: '18px', color: 'var(--accent)' }}>
        Bracker
      </a>
      <a
        href="/dashboard"
        style={{
          color: pathname === '/dashboard' ? 'var(--text)' : 'var(--text-secondary)',
          fontWeight: pathname === '/dashboard' ? 700 : 500,
          fontSize: '15px',
        }}
      >
        Dashboard
      </a>
      <a
        href="/settings"
        style={{
          color: pathname === '/settings' ? 'var(--text)' : 'var(--text-secondary)',
          fontWeight: pathname === '/settings' ? 700 : 500,
          fontSize: '15px',
        }}
      >
        Settings
      </a>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href={`/u/${username}`} style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: 28, height: 28, borderRadius: '50%', verticalAlign: 'middle' }}
            />
          ) : (
            displayName
          )}
        </a>
        <button
          onClick={handleSignOut}
          className="btn-cta"
          style={{ padding: '0 12px', height: '30px', fontSize: '13px' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
