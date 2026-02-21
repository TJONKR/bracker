import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { calculateLevel, xpProgress } from '@/lib/xp';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = createServiceClient();

    // Look up profile by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url, total_xp, total_builds, total_posts, total_tokens, current_streak, last_build_date, created_at')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch recent builds and posts in parallel
    const [buildsResult, postsResult] = await Promise.all([
      supabase
        .from('builds')
        .select('id, repo, diff_summary, conversation_summary, tokens_used, commit_message, lines_changed, xp_earned, streak, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('posts')
        .select('id, url, platform, content, xp_earned, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const levelInfo = calculateLevel(profile.total_xp, profile.total_posts);
    const progress = xpProgress(profile.total_xp);

    return NextResponse.json({
      profile: {
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        total_xp: profile.total_xp,
        total_builds: profile.total_builds,
        total_posts: profile.total_posts,
        total_tokens: profile.total_tokens,
        current_streak: profile.current_streak,
        last_build_date: profile.last_build_date,
        created_at: profile.created_at,
      },
      level: levelInfo,
      xp_progress: progress,
      builds: buildsResult.data || [],
      posts: postsResult.data || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
