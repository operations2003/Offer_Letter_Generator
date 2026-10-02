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
    const employees = await prisma.employee.findMany();
    console.log('Employees in DB:', JSON.stringify(employees.map(e => ({
      id: e.id,
      name: e.fullName,
      email: e.personalEmail,
      empId: e.employeeId,
      designation: e.designation,
      status: e.status
    })), null, 2));
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
