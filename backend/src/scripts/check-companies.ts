import { prisma } from '../prisma/client.js';

async function main() {
  try {
    const companies = await prisma.company.findMany();
    console.log('Companies in DB:', JSON.stringify(companies.map(c => ({ id: c.id, name: c.name, code: c.code }))));
    const roles = await prisma.role.findMany();
    console.log('Roles in DB:', JSON.stringify(roles.map(r => ({ id: r.id, name: r.name, code: r.code }))));
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
    console.log('Users in DB with roles:', JSON.stringify(users.map(u => ({ id: u.id, email: u.email, roles: u.userRoles.map(ur => ({ name: ur.role.name, code: ur.role.code })) }))));
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
