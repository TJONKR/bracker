import { createServiceClient } from '@/lib/supabase/server';

export async function validateApiKey(
  request: Request
): Promise<{ userId: string; error?: never } | { userId?: never; error: string }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header. Expected: Bearer <api_key>' };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey) {
    return { error: 'Empty API key' };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('api_key', apiKey)
    .single();

  if (error || !data) {
    return { error: 'Invalid API key' };
  }

  return { userId: data.id };
}
