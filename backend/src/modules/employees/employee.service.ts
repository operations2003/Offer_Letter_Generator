// =============================================================================
// EMPLOYEE MANAGEMENT SERVICE
// =============================================================================

import { prisma } from '../../prisma/client.js';
import { EmploymentStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../errors/app-error.js';

export interface CreateEmployeeDto {
  companyId?: string;
  employeeId?: string;
  fullName: string;
  personalEmail: string;
  officialEmail?: string;
  phone?: string;
  designation: string;
  department: string;
  employmentType?: string;
  joiningDate: string | Date;
  status?: EmploymentStatus;
  reportingManager?: string;
  workLocation?: string;
  annualCtc?: number;
  currency?: string;
  createdBy?: string;
}

export interface UpdateEmployeeDto {
  fullName?: string;
  personalEmail?: string;
  officialEmail?: string;
  phone?: string;
  designation?: string;
  department?: string;
  employmentType?: string;
  joiningDate?: string | Date;
  status?: EmploymentStatus;
  reportingManager?: string;
  workLocation?: string;
  annualCtc?: number;
  currency?: string;
}

export class EmployeeService {
  private static defaultCompanyId: string | null = null;

  /**
   * Get or fallback to active company ID
   */
  private static async getCompanyId(providedId?: string): Promise<string> {
    if (providedId) return providedId;
    if (this.defaultCompanyId) return this.defaultCompanyId;

    const company = await prisma.company.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (company) {
      this.defaultCompanyId = company.id;
      return company.id;
    }

    // Create default fallback company if none exists
    const created = await prisma.company.create({
      data: {
        code: 'ACME',
        name: 'Acme Technologies Inc.',
        legalName: 'Acme Technologies Global Corp.',
      },
    });
    this.defaultCompanyId = created.id;
    return created.id;
  }

  /**
   * Auto-generate sequential or unique Employee ID
   */
  static generateEmployeeId(): string {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `EMP-${randomDigits}`;
  }

  /**
   * Pre-seed sample employees if table is empty
   */
  static async ensureSeedData(): Promise<void> {
    try {
      const count = await prisma.employee.count({ where: { deletedAt: null } });
      if (count > 0) return;

      const companyId = await this.getCompanyId();

      const seedList: CreateEmployeeDto[] = [
        {
          employeeId: 'EMP-10492',
          fullName: 'Rahul Sharma',
          personalEmail: 'rahul.sharma@example.com',
          officialEmail: 'rahul.s@acme.com',
          phone: '+1 (555) 234-8901',
          designation: 'Senior Full Stack Engineer',
          department: 'Engineering',
          employmentType: 'Full-time',
          joiningDate: new Date('2024-03-15'),
          status: 'ACTIVE' as EmploymentStatus,
          reportingManager: 'Marcus Vance (VP Engineering)',
          workLocation: 'San Francisco, CA (Hybrid)',
          annualCtc: 155000,
          currency: 'USD',
        },
        {
          employeeId: 'EMP-10843',
          fullName: 'Priya Patel',
          personalEmail: 'priya.patel@example.com',
          officialEmail: 'priya.p@acme.com',
          phone: '+1 (555) 345-6789',
          designation: 'Lead Product Manager',
          department: 'Product',
          employmentType: 'Full-time',
          joiningDate: new Date('2023-08-01'),
          status: 'ACTIVE' as EmploymentStatus,
          reportingManager: 'Elena Rostova (Chief Product Officer)',
          workLocation: 'New York, NY',
          annualCtc: 168000,
          currency: 'USD',
        },
        {
          employeeId: 'EMP-11204',
          fullName: 'Liam Alexander Vance',
          personalEmail: 'liam.vance@stanford.edu',
          officialEmail: 'liam.vance@acme.com',
          phone: '+1 (555) 789-0123',
          designation: 'Machine Learning Research Intern',
          department: 'Applied AI Labs',
          employmentType: 'Intern',
          joiningDate: new Date('2026-06-01'),
          status: 'PROBATION' as EmploymentStatus,
          reportingManager: 'Dr. Elena Rostova',
          workLocation: 'Palo Alto, CA (Hybrid)',
          annualCtc: 78000,
          currency: 'USD',
        },
        {
          employeeId: 'EMP-11985',
          fullName: 'Sophia Chen',
          personalEmail: 'sophia.chen@example.com',
          officialEmail: 'sophia.c@acme.com',
          phone: '+1 (555) 456-7890',
          designation: 'Staff Distributed Systems Engineer',
          department: 'Core Infrastructure',
          employmentType: 'Full-time',
          joiningDate: new Date('2022-01-10'),
          status: 'ACTIVE' as EmploymentStatus,
          reportingManager: 'Marcus Vance',
          workLocation: 'Remote (US)',
          annualCtc: 198000,
          currency: 'USD',
        },
      ];

      for (const item of seedList) {
        await prisma.employee.create({
          data: {
            companyId,
            employeeId: item.employeeId!,
            fullName: item.fullName,
            personalEmail: item.personalEmail,
            officialEmail: item.officialEmail,
            phone: item.phone,
            designation: item.designation,
            department: item.department,
            employmentType: item.employmentType || 'Full-time',
            joiningDate: new Date(item.joiningDate),
            status: item.status || ('ACTIVE' as EmploymentStatus),
            reportingManager: item.reportingManager,
            workLocation: item.workLocation,
            annualCtc: item.annualCtc,
            currency: item.currency || 'USD',
          },
        });
      }
      console.log(`[EmployeeService] Successfully pre-seeded ${seedList.length} employees.`);
    } catch (err: any) {
      console.warn('[EmployeeService] Seed skipped or already exists:', err.message);
    }
  }

  /**
   * List all employees with search & filtering
   */
  static async listEmployees(params?: {
    companyId?: string;
    search?: string;
    department?: string;
    status?: string;
  }) {
    await this.ensureSeedData();
    const companyId = await this.getCompanyId(params?.companyId);

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status as EmploymentStatus;
    }

    if (params?.department && params.department !== 'ALL') {
      where.department = params.department;
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { employeeId: { contains: q, mode: 'insensitive' } },
        { personalEmail: { contains: q, mode: 'insensitive' } },
        { officialEmail: { contains: q, mode: 'insensitive' } },
        { designation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        documents: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            documentTypeCode: true,
            status: true,
            currentVersion: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return employees.map((emp) => ({
      ...emp,
      annualCtc: emp.annualCtc ? Number(emp.annualCtc) : null,
      documentCount: emp.documents.length,
    }));
  }

  /**
   * Get employee by ID with full documents & version history
   */
  static async getEmployeeById(id: string, companyId?: string) {
    const activeCompanyId = await this.getCompanyId(companyId);

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: activeCompanyId,
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            legalName: true,
            domain: true,
          },
        },
        documents: {
          where: { deletedAt: null },
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
            },
            generator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundError(`Employee with ID ${id} not found`);
    }

    return {
      ...employee,
      annualCtc: employee.annualCtc ? Number(employee.annualCtc) : null,
      documents: employee.documents.map((doc) => ({
        ...doc,
        fileSizeBytes: doc.fileSizeBytes ? Number(doc.fileSizeBytes) : null,
      })),
    };
  }

  /**
   * Create a new employee with essential details
   */
  static async createEmployee(dto: CreateEmployeeDto) {
    const companyId = await this.getCompanyId(dto.companyId);

    if (!dto.fullName || !dto.fullName.trim()) {
      throw new ValidationError('Employee full name is required');
    }
    if (!dto.personalEmail || !dto.personalEmail.trim()) {
      throw new ValidationError('Personal email is required');
    }
    if (!dto.designation || !dto.designation.trim()) {
      throw new ValidationError('Designation is required');
    }
    if (!dto.department || !dto.department.trim()) {
      throw new ValidationError('Department is required');
    }

    const employeeId = dto.employeeId && dto.employeeId.trim()
      ? dto.employeeId.trim().toUpperCase()
      : this.generateEmployeeId();

    // Check unique employeeId
    const existing = await prisma.employee.findFirst({
      where: {
        companyId,
        employeeId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ValidationError(`Employee with ID ${employeeId} already exists`);
    }

    const created = await prisma.employee.create({
      data: {
        companyId,
        employeeId,
        fullName: dto.fullName.trim(),
        personalEmail: dto.personalEmail.trim().toLowerCase(),
        officialEmail: dto.officialEmail ? dto.officialEmail.trim().toLowerCase() : null,
        phone: dto.phone?.trim() || null,
        designation: dto.designation.trim(),
        department: dto.department.trim(),
        employmentType: dto.employmentType || 'Full-time',
        joiningDate: new Date(dto.joiningDate || new Date()),
        status: dto.status || ('ACTIVE' as EmploymentStatus),
        reportingManager: dto.reportingManager?.trim() || null,
        workLocation: dto.workLocation?.trim() || null,
        annualCtc: dto.annualCtc ? Number(dto.annualCtc) : null,
        currency: dto.currency || 'USD',
        createdBy: dto.createdBy || null,
      },
    });

    return {
      ...created,
      annualCtc: created.annualCtc ? Number(created.annualCtc) : null,
    };
  }

  /**
   * Update an existing employee
   */
  static async updateEmployee(id: string, dto: UpdateEmployeeDto, companyId?: string) {
    const activeCompanyId = await this.getCompanyId(companyId);

    const existing = await prisma.employee.findFirst({
      where: { id, companyId: activeCompanyId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError(`Employee with ID ${id} not found`);
    }

    const updateData: any = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName.trim();
    if (dto.personalEmail !== undefined) updateData.personalEmail = dto.personalEmail.trim().toLowerCase();
    if (dto.officialEmail !== undefined) updateData.officialEmail = dto.officialEmail?.trim().toLowerCase() || null;
    if (dto.phone !== undefined) updateData.phone = dto.phone?.trim() || null;
    if (dto.designation !== undefined) updateData.designation = dto.designation.trim();
    if (dto.department !== undefined) updateData.department = dto.department.trim();
    if (dto.employmentType !== undefined) updateData.employmentType = dto.employmentType;
    if (dto.joiningDate !== undefined) updateData.joiningDate = new Date(dto.joiningDate);
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.reportingManager !== undefined) updateData.reportingManager = dto.reportingManager?.trim() || null;
    if (dto.workLocation !== undefined) updateData.workLocation = dto.workLocation?.trim() || null;
    if (dto.annualCtc !== undefined) updateData.annualCtc = dto.annualCtc ? Number(dto.annualCtc) : null;
    if (dto.currency !== undefined) updateData.currency = dto.currency;

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updated,
      annualCtc: updated.annualCtc ? Number(updated.annualCtc) : null,
    };
  }

  /**
   * Soft delete employee
   */
  static async deleteEmployee(id: string, companyId?: string) {
    const activeCompanyId = await this.getCompanyId(companyId);

    const existing = await prisma.employee.findFirst({
      where: { id, companyId: activeCompanyId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError(`Employee with ID ${id} not found`);
    }

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Employee archived successfully' };
  }
}
