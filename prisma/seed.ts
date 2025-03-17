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

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'project1' },
    update: {},
    create: {
      id: 'project1',
      name: 'Sample Project 1',
      description: 'This is a sample project for testing purposes',
      userId: testUser.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'project2' },
    update: {},
    create: {
      id: 'project2',
      name: 'Sample Project 2',
      description: 'Another sample project for testing',
      userId: testUser.id,
    },
  });

  console.log('Created sample projects:', project1.id, project2.id);
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