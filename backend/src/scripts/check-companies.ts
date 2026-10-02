import { prisma } from '../prisma/client.js';

async function main() {
  try {
    const companies = await prisma.company.findMany();
    console.log('Companies in DB:', JSON.stringify(companies.map(c => ({ id: c.id, name: c.name, code: c.code }))));
    const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true } });
    console.log('Users in DB:', JSON.stringify(users));
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
