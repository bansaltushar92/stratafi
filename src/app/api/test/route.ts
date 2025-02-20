import { supabase } from '@/lib/supabase/client';
import { getAuth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return new Response('Error fetching profile', { status: 500 });
    }

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 