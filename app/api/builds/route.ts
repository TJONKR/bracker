import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { extractLinesChanged, calculateBuildXp, calculateLevel } from '@/lib/xp';

export async function POST(request: Request) {
  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { repo, diff_summary, conversation_summary, tokens_used = 0, commit_message } = body;

    if (!diff_summary || !commit_message) {
      return NextResponse.json(
        { error: 'Missing required fields: diff_summary, commit_message' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const linesChanged = extractLinesChanged(diff_summary);

    // Get current profile for streak calculation
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak, last_build_date, total_xp, total_builds, total_posts, total_tokens')
      .eq('id', auth.userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Calculate streak
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let newStreak = 1;

    if (profile.last_build_date) {
      const lastDate = new Date(profile.last_build_date).toISOString().split('T')[0];
      if (lastDate === today) {
        // Already built today, keep current streak
        newStreak = profile.current_streak;
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastDate === yesterdayStr) {
          // Built yesterday, increment streak
          newStreak = profile.current_streak + 1;
        }
        // Otherwise reset to 1 (default)
      }
    }

    // Calculate XP
    const xpResult = calculateBuildXp(tokens_used, linesChanged, newStreak);

    // Insert build row
    const { data: build, error: buildError } = await supabase
      .from('builds')
      .insert({
        user_id: auth.userId,
        repo,
        diff_summary,
        conversation_summary,
        tokens_used,
        commit_message,
        lines_changed: linesChanged,
        xp_earned: xpResult.totalXp,
        streak: newStreak,
      })
      .select()
      .single();

    if (buildError) {
      return NextResponse.json({ error: 'Failed to create build' }, { status: 500 });
    }

    // Update profile
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        total_xp: profile.total_xp + xpResult.totalXp,
        total_builds: profile.total_builds + 1,
        total_tokens: profile.total_tokens + tokens_used,
        current_streak: newStreak,
        last_build_date: now.toISOString(),
      })
      .eq('id', auth.userId);

    if (profileUpdateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    const newTotalXp = profile.total_xp + xpResult.totalXp;
    const levelInfo = calculateLevel(newTotalXp, profile.total_posts);

    return NextResponse.json({
      build: {
        id: build.id,
        repo,
        lines_changed: linesChanged,
        xp_earned: xpResult.totalXp,
        streak: newStreak,
        created_at: build.created_at,
      },
      xp: xpResult,
      level: levelInfo,
      total_xp: newTotalXp,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
