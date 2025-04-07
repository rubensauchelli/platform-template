import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { HTTP_STATUS } from '@/types/api';

// Get webhook secret at runtime rather than initialization
const getWebhookSecret = () => process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = getWebhookSecret();
  
  // Return error if webhook secret is missing
  if (!webhookSecret) {
    console.warn('Missing CLERK_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: HTTP_STATUS.SERVER_ERROR }
    );
  }

  const wh = new Webhook(webhookSecret);
  
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing webhook headers' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
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
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
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

    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: HTTP_STATUS.SUCCESS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.SERVER_ERROR }
    );
  }
} 