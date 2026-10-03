import { prisma } from './client.js';
import { CryptoUtil } from '../utils/crypto.js';

export async function runSeed() {
  console.log('🌱 Starting database seed for Offer Letter Generator...');

  // 1. Create or retrieve Default Company
  const company = await prisma.company.upsert({
    where: { code: 'ACME' },
    update: {},
    create: {
      name: 'Acme Technologies Inc.',
      code: 'ACME',
      legalName: 'Acme Technologies Global Corp.',
      domain: 'acme.com',
      settings: {
        defaultCurrency: 'USD',
        offerValidityDays: 14,
        allowDigitalSignature: true,
      },
    },
  });
  console.log(`✅ Company seeded: ${company.name} (${company.code})`);

  // 2. Define System Roles & Granular Permissions
  const roleDefinitions = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      description: 'Unrestricted administrative access across entire tenant and settings',
      isSystemRole: true,
      permissions: ['*'],
    },
    {
      code: 'HR_MANAGER',
      name: 'HR Operations Manager',
      description: 'Manages offer lifecycles, template revisions, overrides, and final issuance',
      isSystemRole: true,
      permissions: [
        'offers:create',
        'offers:read',
        'offers:update',
        'offers:issue',
        'templates:read',
        'templates:write',
        'candidates:create',
        'candidates:read',
        'candidates:update',
        'ai:extract',
        'audit:read',
      ],
    },
    {
      code: 'RECRUITER',
      name: 'Talent Acquisition Recruiter',
      description: 'Uploads candidate documents, triggers AI extraction, and creates draft offers',
      isSystemRole: true,
      permissions: [
        'candidates:create',
        'candidates:read',
        'candidates:update',
        'offers:create',
        'offers:read',
        'ai:extract',
      ],
    },
    {
      code: 'APPROVER',
      name: 'Department / Finance Approver',
      description: 'Reviews proposed offer compensation terms and signs off on approvals',
      isSystemRole: true,
      permissions: ['offers:read', 'offers:approve', 'offers:reject', 'ai:check-policy'],
    },
    {
      code: 'AUDITOR',
      name: 'Compliance & Legal Auditor',
      description: 'Read-only access to offers, documents, and immutable audit logs',
      isSystemRole: true,
      permissions: ['offers:read', 'audit:read', 'documents:verify'],
    },
  ];

  const seededRoles: Record<string, string> = {};

  for (const r of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: {
        name: r.name,
        description: r.description,
        permissions: r.permissions,
      },
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        isSystemRole: r.isSystemRole,
        permissions: r.permissions,
      },
    });
    seededRoles[r.code] = role.id;
    console.log(`✅ Role seeded: ${role.code} (${role.name})`);
  }

  // 3. Create Default Super Admin User
  const adminPasswordHash = await CryptoUtil.hashPassword('Admin@Password123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
    },
    create: {
      companyId: company.id,
      email: 'admin@acme.com',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      title: 'Head of People Systems',
      department: 'Executive',
      status: 'ACTIVE',
    },
  });

  // Assign SUPER_ADMIN role to admin user
  await prisma.userRole.upsert({
    where: {
      uq_user_role: {
        userId: adminUser.id,
        roleId: seededRoles['SUPER_ADMIN'],
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: seededRoles['SUPER_ADMIN'],
    },
  });
  console.log(`✅ Default Super Admin seeded: ${adminUser.email} (Password: Admin@Password123)`);

  // 4. Create Default HR Manager User
  const hrPasswordHash = await CryptoUtil.hashPassword('Hr@Password123');
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@acme.com' },
    update: {
      passwordHash: hrPasswordHash,
      status: 'ACTIVE',
    },
    create: {
      companyId: company.id,
      email: 'hr@acme.com',
      passwordHash: hrPasswordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      title: 'Lead HR Business Partner',
      department: 'Human Resources',
      status: 'ACTIVE',
    },
  });

  // Assign HR_MANAGER role to HR user
  await prisma.userRole.upsert({
    where: {
      uq_user_role: {
        userId: hrUser.id,
        roleId: seededRoles['HR_MANAGER'],
      },
    },
    update: {},
    create: {
      userId: hrUser.id,
      roleId: seededRoles['HR_MANAGER'],
    },
  });
  console.log(`✅ Default HR Manager seeded: ${hrUser.email} (Password: Hr@Password123)`);

  console.log('🎉 Database seeding completed successfully.');
}

// Execute seed
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seed.ts')) {
  runSeed()
    .catch((e) => {
      console.error('❌ Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

