import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test user (normally this would be created by Clerk)
  const testUser = await prisma.user.upsert({
    where: { clerkId: 'test_clerk_id' },
    update: {},
    create: {
      clerkId: 'test_clerk_id',
    },
  });

  console.log('Created test user:', testUser.id);
  console.log('Database seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 