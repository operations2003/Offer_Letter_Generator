import { prisma } from '../prisma/client.js';
import { CryptoUtil } from '../utils/crypto.js';

async function setAdmin() {
  console.log('🔄 Setting up admin credentials for sheetalbedi@tasknera.com...');

  // 1. Ensure company exists (TaskNera Enterprise or existing default)
  let company = await prisma.company.findFirst({
    where: {
      OR: [{ code: 'TASKNERA' }, { code: 'ACME' }]
    }
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'TaskNera Enterprise',
        code: 'TASKNERA',
        legalName: 'TaskNera Technologies Pvt. Ltd.',
        domain: 'tasknera.com',
        settings: {
          defaultCurrency: 'INR',
          offerValidityDays: 14,
          allowDigitalSignature: true,
        },
      },
    });
    console.log(`✅ Company created: ${company.name} (${company.code})`);
  } else {
    console.log(`ℹ️ Using existing company: ${company.name} (${company.code})`);
  }

  // 2. Ensure SUPER_ADMIN role exists
  let adminRole = await prisma.role.findUnique({
    where: { code: 'SUPER_ADMIN' },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        code: 'SUPER_ADMIN',
        name: 'Super Administrator',
        description: 'Unrestricted administrative access across entire tenant and settings',
        isSystemRole: true,
        permissions: ['*'],
      },
    });
    console.log(`✅ SUPER_ADMIN role created`);
  } else {
    console.log(`ℹ️ Found SUPER_ADMIN role`);
  }

  // 3. Hash password: Tasknera@2003
  const passwordHash = await CryptoUtil.hashPassword('Tasknera@2003');

  // 4. Upsert admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'sheetalbedi@tasknera.com' },
    update: {
      passwordHash,
      status: 'ACTIVE',
      firstName: 'Sheetal',
      lastName: 'Bedi',
      title: 'Administrator',
      department: 'Executive',
    },
    create: {
      companyId: company.id,
      email: 'sheetalbedi@tasknera.com',
      passwordHash,
      firstName: 'Sheetal',
      lastName: 'Bedi',
      title: 'Administrator',
      department: 'Executive',
      status: 'ACTIVE',
    },
  });

  // 5. Assign SUPER_ADMIN role
  await prisma.userRole.upsert({
    where: {
      uq_user_role: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log(`🎉 Successfully configured admin user:`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Role: SUPER_ADMIN`);
  console.log(`   Status: ${adminUser.status}`);
}

setAdmin()
  .catch((err) => {
    console.error('❌ Error setting admin credentials:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
