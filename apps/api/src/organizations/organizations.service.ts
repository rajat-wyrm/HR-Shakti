import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('An organization with this slug already exists');
    }

    const org = await this.prisma.organization.create({ data: dto });

    await this.prisma.organizationMember.create({
      data: { organizationId: org.id, userId, role: 'admin' },
    });

    return org;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      this.prisma.organization.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org || org.deletedAt) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, userId: string, dto: UpdateOrganizationDto) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org || org.deletedAt) throw new NotFoundException('Organization not found');

    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId } },
    });
    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Only admins can update this organization');
    }

    if (dto.slug && dto.slug !== org.slug) {
      const slugExists = await this.prisma.organization.findUnique({ where: { slug: dto.slug } });
      if (slugExists) throw new ConflictException('A organization with this slug already exists');
    }

    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async claim(id: string, userId: string, workEmail: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org || org.deletedAt) throw new NotFoundException('Organization not found');

    const existingClaim = await this.prisma.organizationClaim.findFirst({
      where: { organizationId: id, userId },
    });
    if (existingClaim) {
      throw new ConflictException('You already have a pending claim for this organization');
    }

    const token = Math.random().toString(36).substring(2, 10);

    const claim = await this.prisma.organizationClaim.create({
      data: { organizationId: id, userId, workEmail, status: 'pending', verificationToken: token },
    });

    return { message: 'Verification email sent', claimId: claim.id };
  }

  async verifyClaim(id: string, userId: string, token: string) {
    const claim = await this.prisma.organizationClaim.findFirst({
      where: { organizationId: id, userId, status: 'pending' },
    });
    if (!claim) throw new NotFoundException('No pending claim found');
    if (claim.verificationToken !== token) {
      throw new ForbiddenException('Invalid verification token');
    }

    await this.prisma.organizationClaim.update({
      where: { id: claim.id },
      data: { status: 'approved' },
    });

    await this.prisma.organizationMember.create({
      data: { organizationId: id, userId, role: 'admin' },
    });

    await this.prisma.organization.update({
      where: { id },
      data: { isVerified: true },
    });

    return { message: 'Organization claimed successfully' };
  }

  async addMember(id: string, userId: string, memberUserId: string, role: string, title?: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId } },
    });
    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Only admins can add members');
    }

    const existing = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId: memberUserId } },
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.prisma.organizationMember.create({
      data: { organizationId: id, userId: memberUserId, role, title },
    });
  }

  async updateMemberRole(id: string, userId: string, memberUserId: string, role: string, title?: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId } },
    });
    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Only admins can update member roles');
    }

    const target = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId: memberUserId } },
    });
    if (!target) throw new NotFoundException('Member not found');

    return this.prisma.organizationMember.update({
      where: { organizationId_userId: { organizationId: id, userId: memberUserId } },
      data: { role, title },
    });
  }

  async removeMember(id: string, userId: string, memberUserId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId } },
    });
    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Only admins can remove members');
    }

    const target = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId: memberUserId } },
    });
    if (!target) throw new NotFoundException('Member not found');

    await this.prisma.organizationMember.delete({
      where: { organizationId_userId: { organizationId: id, userId: memberUserId } },
    });
    return { message: 'Member removed' };
  }
}
