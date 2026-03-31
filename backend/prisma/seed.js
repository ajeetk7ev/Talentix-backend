import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding plans...');

  const plans = [
    {
      title: 'Monthly',
      price: 59,
      duration: 1,
      features: ['Access to Premium Jobs', 'Priority Support', 'Community Support']
    },
    {
      title: 'Quarterly',
      price: 99,
      duration: 3,
      features: ['Access to Premium Jobs', 'Priority Support', 'Community Support', 'Job Match Notifications']
    }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.title === 'Monthly' ? 'monthly-plan-id' : 'quarterly-plan-id' }, // Just a stable way to seed if we have IDs, but here we can just use title if we add @unique to title in schema.
      // Since title is not unique, I'll just use create if not exist logic
      update: {},
      create: plan
    });
  }

  console.log('Plans seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
