import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    // Get the headers
    const headersList = headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new Response('Error occurred -- no svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt: WebhookEvent;

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', {
        status: 400
      });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log('Received webhook event:', eventType);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const full_name = [first_name, last_name].filter(Boolean).join(' ');

      console.log('Syncing user to Supabase:', { id, email, full_name });

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id,
          email,
          full_name,
          role: 'user',
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error syncing user to Supabase:', error);
        return new Response('Error syncing user', {
          status: 500
        });
      }

      console.log('Successfully synced user to Supabase');
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      console.log('Deleting user from Supabase:', id);

      const { error } = await supabase
        .from('profiles')
        .delete()
        .match({ id });

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error deleting user', {
          status: 500
        });
      }

      console.log('Successfully deleted user from Supabase');
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 