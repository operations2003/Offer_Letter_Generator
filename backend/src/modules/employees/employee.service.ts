// =============================================================================
// EMPLOYEE MANAGEMENT SERVICE
// Synchronized with Prisma schema (granular profile, address & compensation)
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

  // Additional granular employee & compensation details
  title?: string;
  firstName?: string;
  lastName?: string;
  pinCode?: string;
  city?: string;
  state?: string;
  addressLine?: string;
  basicPercent?: number;
  hraPercent?: number;
  incentiveApplicable?: boolean;
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

  title?: string;
  firstName?: string;
  lastName?: string;
  pinCode?: string;
  city?: string;
  state?: string;
  addressLine?: string;
  basicPercent?: number;
  hraPercent?: number;
  incentiveApplicable?: boolean;
}

export class EmployeeService {
  private static defaultCompanyId: string | null = null;

  /**
   * Get or fallback to active company ID
   */
  private static async getCompanyId(providedId?: string): Promise<string> {
    if (providedId) {
      try {
        const found = await prisma.company.findUnique({
          where: { id: providedId },
        });
        if (found && !found.deletedAt) {
          return found.id;
        }
      } catch {
        // providedId was not a valid UUID format or query error
      }
    }

    if (this.defaultCompanyId) {
      try {
        const cached = await prisma.company.findUnique({
          where: { id: this.defaultCompanyId },
        });
        if (cached && !cached.deletedAt) return cached.id;
      } catch {
        this.defaultCompanyId = null;
      }
    }

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
   * List all employees with search & filtering
   */
  static async listEmployees(params?: {
    companyId?: string;
    search?: string;
    department?: string;
    status?: string;
  }) {
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
      basicPercent: emp.basicPercent ? Number(emp.basicPercent) : null,
      hraPercent: emp.hraPercent ? Number(emp.hraPercent) : null,
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
      basicPercent: employee.basicPercent ? Number(employee.basicPercent) : null,
      hraPercent: employee.hraPercent ? Number(employee.hraPercent) : null,
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

    // Verify createdBy user exists in database to prevent foreign key violation
    let validCreatedBy: string | null = null;
    if (dto.createdBy) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: dto.createdBy },
        });
        if (user && !user.deletedAt) {
          validCreatedBy = user.id;
        }
      } catch {
        validCreatedBy = null;
      }
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
        currency: dto.currency || 'INR',
        createdBy: validCreatedBy,

        // Profile & Address details
        title: dto.title?.trim() || null,
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        pinCode: dto.pinCode?.trim() || null,
        city: dto.city?.trim() || null,
        state: dto.state?.trim() || null,
        addressLine: dto.addressLine?.trim() || null,
        basicPercent: dto.basicPercent !== undefined && dto.basicPercent !== null ? Number(dto.basicPercent) : null,
        hraPercent: dto.hraPercent !== undefined && dto.hraPercent !== null ? Number(dto.hraPercent) : null,
        incentiveApplicable: dto.incentiveApplicable ?? false,
      },
    });

    return {
      ...created,
      annualCtc: created.annualCtc ? Number(created.annualCtc) : null,
      basicPercent: created.basicPercent ? Number(created.basicPercent) : null,
      hraPercent: created.hraPercent ? Number(created.hraPercent) : null,
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

    if (dto.title !== undefined) updateData.title = dto.title?.trim() || null;
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName?.trim() || null;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName?.trim() || null;
    if (dto.pinCode !== undefined) updateData.pinCode = dto.pinCode?.trim() || null;
    if (dto.city !== undefined) updateData.city = dto.city?.trim() || null;
    if (dto.state !== undefined) updateData.state = dto.state?.trim() || null;
    if (dto.addressLine !== undefined) updateData.addressLine = dto.addressLine?.trim() || null;
    if (dto.basicPercent !== undefined) updateData.basicPercent = dto.basicPercent ? Number(dto.basicPercent) : null;
    if (dto.hraPercent !== undefined) updateData.hraPercent = dto.hraPercent ? Number(dto.hraPercent) : null;
    if (dto.incentiveApplicable !== undefined) updateData.incentiveApplicable = Boolean(dto.incentiveApplicable);

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updated,
      annualCtc: updated.annualCtc ? Number(updated.annualCtc) : null,
      basicPercent: updated.basicPercent ? Number(updated.basicPercent) : null,
      hraPercent: updated.hraPercent ? Number(updated.hraPercent) : null,
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
