import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Migrating roles...');

  // Update all USER to CANDIDATE
  const updatedUsers = await prisma.user.updateMany({
    where: { role: 'USER' },
    data: { role: 'CANDIDATE' }
  });
  console.log(`Updated ${updatedUsers.count} USER roles to CANDIDATE.`);

  // Update all RECRUITER to CANDIDATE
  const updatedRecruiters = await prisma.user.updateMany({
    where: { role: 'RECRUITER' },
    data: { role: 'CANDIDATE' }
  });
  console.log(`Updated ${updatedRecruiters.count} RECRUITER roles to CANDIDATE.`);

  // Create an initial admin if none exists
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminExists) {
    console.log('No ADMIN found. Please create an admin manually or via signup (if permitted temporarily).');
    // For now, I won't auto-create one with a dummy password for security, 
    // but I'll add a note for the user.
  }

  console.log('Role migration complete.');
}

main()
  .catch((e) => {
    console.error('MIGRATION ERROR DETAIL:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
