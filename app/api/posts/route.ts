import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { POST_XP, calculateLevel } from '@/lib/xp';

export async function POST(request: Request) {
  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { url, platform = 'twitter', content } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_xp, total_posts')
      .eq('id', auth.userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Insert post row
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: auth.userId,
        url,
        platform,
        content,
        xp_earned: POST_XP,
      })
      .select()
      .single();

    if (postError) {
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_xp: profile.total_xp + POST_XP,
        total_posts: profile.total_posts + 1,
      })
      .eq('id', auth.userId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    const newTotalXp = profile.total_xp + POST_XP;
    const newTotalPosts = profile.total_posts + 1;
    const levelInfo = calculateLevel(newTotalXp, newTotalPosts);

    return NextResponse.json({
      post: {
        id: post.id,
        url,
        platform,
        xp_earned: POST_XP,
        created_at: post.created_at,
      },
      level: levelInfo,
      total_xp: newTotalXp,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
