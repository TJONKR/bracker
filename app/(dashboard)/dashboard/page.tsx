'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calculateLevel, xpProgress } from '@/lib/xp';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  total_xp: number;
  total_builds: number;
  total_posts: number;
  current_streak: number;
}

interface Build {
  id: string;
  repo: string | null;
  conversation_summary: string | null;
  xp_earned: number;
  streak: number;
  created_at: string;
}

interface Post {
  id: string;
  url: string;
  platform: string;
  content: string | null;
  xp_earned: number;
  created_at: string;
}

type FeedItem =
  | { type: 'build'; data: Build }
  | { type: 'post'; data: Post };

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let buildChannel: ReturnType<typeof supabase.channel> | null = null;
    let postChannel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, buildsRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('builds')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);

      const items: FeedItem[] = [
        ...(buildsRes.data || []).map((b) => ({ type: 'build' as const, data: b as Build })),
        ...(postsRes.data || []).map((p) => ({ type: 'post' as const, data: p as Post })),
      ];
      items.sort((a, b) =>
        new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
      );
      setFeed(items);
      setLoading(false);

      // Subscribe to realtime builds
      buildChannel = supabase
        .channel('dashboard-builds')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'builds', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newBuild = payload.new as Build;
            setFeed((prev) => [{ type: 'build', data: newBuild }, ...prev]);
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    total_xp: prev.total_xp + newBuild.xp_earned,
                    total_builds: prev.total_builds + 1,
                    current_streak: newBuild.streak,
                  }
                : prev
            );
          }
        )
        .subscribe();

      // Subscribe to realtime posts
      postChannel = supabase
        .channel('dashboard-posts')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'posts', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newPost = payload.new as Post;
            setFeed((prev) => [{ type: 'post', data: newPost }, ...prev]);
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    total_xp: prev.total_xp + newPost.xp_earned,
                    total_posts: prev.total_posts + 1,
                  }
                : prev
            );
          }
        )
        .subscribe();
    }

    load();

    return () => {
      if (buildChannel) supabase.removeChannel(buildChannel);
      if (postChannel) supabase.removeChannel(postChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-header">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard-header">
        <p>Could not load profile.</p>
      </div>
    );
  }

  const level = calculateLevel(profile.total_xp, profile.total_posts);
  const progress = xpProgress(profile.total_xp);

  return (
    <>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>{level.title} &middot; Level {level.level}</p>
      </div>

      {/* XP Bar */}
      <div className="xp-section">
        <div className="xp-label">
          <span>Level {level.level}</span>
          <span>
            <strong>{progress.current.toLocaleString()}</strong> / {progress.required.toLocaleString()} XP
          </span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${progress.percentage}%` }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{profile.total_xp.toLocaleString()}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{level.level}</div>
          <div className="stat-label">Level</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.total_builds}</div>
          <div className="stat-label">Builds</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.total_posts}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card wide">
          <div className="stat-value">{profile.current_streak} day{profile.current_streak !== 1 ? 's' : ''}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {feed.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No activity yet. Start building to earn XP!
          </div>
        )}
        {feed.map((item) => (
          <div key={item.data.id} className="post">
            <div className="post-avatar">
              {item.type === 'build' ? '\u{1F528}' : '\u{1F4E3}'}
            </div>
            <div className="post-body">
              <div className="post-header">
                <span className="post-name">
                  {item.type === 'build' ? 'Build' : 'Post'}
                </span>
                <span className="post-handle">
                  +{item.data.xp_earned} XP
                </span>
                <span className="post-time">
                  &middot; {formatTime(item.data.created_at)}
                </span>
              </div>
              <div className="post-text">
                {item.type === 'build'
                  ? buildText(item.data)
                  : postText(item.data)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function buildText(b: Build): string {
  const parts: string[] = [];
  if (b.repo) parts.push(b.repo);
  if (b.conversation_summary) parts.push(b.conversation_summary);
  if (parts.length === 0) parts.push('Code shipped');
  if (b.streak > 1) parts.push(`Streak: ${b.streak} days`);
  return parts.join(' \u2022 ');
}

function postText(p: Post): string {
  if (p.content) return p.content;
  return `Shared on ${p.platform}`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
