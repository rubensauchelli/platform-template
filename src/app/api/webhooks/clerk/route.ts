import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { HTTP_STATUS } from '@/types/api';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
}

const wh = new Webhook(webhookSecret as string);

export async function POST(req: Request): Promise<Response> {
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing webhook headers', { status: HTTP_STATUS.UNAUTHORIZED });
  }

  let evt: WebhookEvent;

  try {
    const payload = await req.text();
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: HTTP_STATUS.UNAUTHORIZED });
  }

  try {
    switch (evt.type) {
      case 'user.created': {
        const user = await prisma.user.create({
          data: {
            clerkId: evt.data.id,
          },
        });
        break;
      }

      case 'user.updated': {
        const user = await prisma.user.update({
          where: { clerkId: evt.data.id },
          data: {},
        });
        break;
      }

      case 'user.deleted': {
        const user = await prisma.user.delete({
          where: { clerkId: evt.data.id }
        });
        break;
      }
    }

    return new Response('Webhook processed successfully', { status: HTTP_STATUS.SUCCESS });
  } catch (error) {
    return new Response('Internal Server Error', { status: HTTP_STATUS.SERVER_ERROR });
  }
} 