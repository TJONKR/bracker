import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { calculateLevel } from '@/lib/xp';
import Banner from '@/components/profile/Banner';
import Avatar from '@/components/profile/Avatar';
import ProfileInfo from '@/components/profile/ProfileInfo';
import XpBar from '@/components/profile/XpBar';
import ProfileTabs from './ProfileTabs';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, total_xp, total_posts')
    .eq('username', username)
    .single();

  if (!profile) {
    return { title: 'Not Found - Bracker' };
  }

  const level = calculateLevel(Number(profile.total_xp), Number(profile.total_posts));

  return {
    title: `${username} - Bracker`,
    description: `${profile.display_name || username} is Level ${level.level} ${level.name} on Bracker. ${level.description}`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  const [{ data: builds }, { data: posts }] = await Promise.all([
    supabase
      .from('builds')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const mappedBuilds = (builds || []).map((b) => ({
    id: b.id,
    repo: b.repo ?? undefined,
    commitMessage: b.commit_message ?? undefined,
    xpEarned: b.xp_earned,
    streak: b.streak,
    linesChanged: b.lines_changed,
    createdAt: b.created_at,
    displayName: profile.display_name ?? undefined,
    username: profile.username,
    avatarUrl: profile.avatar_url ?? undefined,
  }));

  const mappedPosts = (posts || []).map((p) => ({
    id: p.id,
    url: p.url,
    platform: p.platform,
    content: p.content ?? undefined,
    xpEarned: p.xp_earned,
    createdAt: p.created_at,
    displayName: profile.display_name ?? undefined,
    username: profile.username,
    avatarUrl: profile.avatar_url ?? undefined,
  }));

  const level = calculateLevel(Number(profile.total_xp), Number(profile.total_posts));

  return (
    <div className="shell">
      <div className="topbar">
        <a href="/" className="topbar-back" style={{ textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--text)">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </a>
        <div className="topbar-info">
          <h2>{profile.display_name || profile.username}</h2>
          <span>{level.emoji} Level {level.level} {level.name}</span>
        </div>
      </div>

      <Banner />

      <div className="avatar-row">
        <Avatar avatarUrl={profile.avatar_url ?? undefined} />
      </div>

      <ProfileInfo
        displayName={profile.display_name || profile.username}
        username={profile.username}
        bio={profile.bio ?? undefined}
        joinedDate={joinedDate}
      />

      <XpBar totalXp={Number(profile.total_xp)} postCount={Number(profile.total_posts)} />

      <ProfileTabs
        builds={mappedBuilds}
        posts={mappedPosts}
        totalXp={Number(profile.total_xp)}
        totalBuilds={Number(profile.total_builds)}
        totalPosts={Number(profile.total_posts)}
        totalTokens={Number(profile.total_tokens)}
        currentStreak={profile.current_streak}
        postCount={Number(profile.total_posts)}
      />
    </div>
  );
}
