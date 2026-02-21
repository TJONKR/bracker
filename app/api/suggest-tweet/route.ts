import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { calculateLevel, generateTweetDraft } from '@/lib/xp';

export async function GET(request: Request) {
  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_xp, total_builds, total_posts')
      .eq('id', auth.userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch today's builds
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: builds, error: buildsError } = await supabase
      .from('builds')
      .select('repo, xp_earned, conversation_summary')
      .eq('user_id', auth.userId)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    if (buildsError) {
      return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 });
    }

    const levelInfo = calculateLevel(profile.total_xp, profile.total_posts);

    const buildData = (builds || []).map((b: { repo: string; xp_earned: number; conversation_summary: string }) => ({
      repo: b.repo,
      xpEarned: b.xp_earned,
      conversationSummary: b.conversation_summary,
    }));

    const draft = generateTweetDraft(buildData, 'raw', levelInfo);

    return NextResponse.json({
      draft,
      stats: {
        builds_today: buildData.length,
        total_xp: profile.total_xp,
        total_builds: profile.total_builds,
        total_posts: profile.total_posts,
        level: levelInfo,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
