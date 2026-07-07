import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private sanitizeUser(user: any) {
    if (!user) return user;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        education: { orderBy: { startDate: 'desc' } },
        certifications: { orderBy: { earnedDate: 'desc' } },
        skills: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.headline !== undefined) data.headline = dto.headline;
    if (dto.about !== undefined) data.about = dto.about;
    if (dto.locationCity !== undefined) data.locationCity = dto.locationCity;
    if (dto.locationCountry !== undefined) data.locationCountry = dto.locationCountry;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.linkedinUrl !== undefined) data.linkedinUrl = dto.linkedinUrl;

    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async addExperience(userId: string, dto: any) {
    return this.prisma.userExperience.create({ data: { ...dto, userId } });
  }

  async updateExperience(experienceId: string, userId: string, dto: any) {
    const exp = await this.prisma.userExperience.findFirst({ where: { id: experienceId, userId } });
    if (!exp) throw new NotFoundException('Experience not found');
    return this.prisma.userExperience.update({ where: { id: experienceId }, data: dto });
  }

  async deleteExperience(experienceId: string, userId: string) {
    const exp = await this.prisma.userExperience.findFirst({ where: { id: experienceId, userId } });
    if (!exp) throw new NotFoundException('Experience not found');
    return this.prisma.userExperience.delete({ where: { id: experienceId } });
  }

  async addEducation(userId: string, dto: any) {
    return this.prisma.userEducation.create({ data: { ...dto, userId } });
  }

  async deleteEducation(educationId: string, userId: string) {
    const edu = await this.prisma.userEducation.findFirst({ where: { id: educationId, userId } });
    if (!edu) throw new NotFoundException('Education not found');
    return this.prisma.userEducation.delete({ where: { id: educationId } });
  }

  async addCertification(userId: string, dto: any) {
    return this.prisma.userCertification.create({ data: { ...dto, userId } });
  }

  async deleteCertification(certId: string, userId: string) {
    const cert = await this.prisma.userCertification.findFirst({ where: { id: certId, userId } });
    if (!cert) throw new NotFoundException('Certification not found');
    return this.prisma.userCertification.delete({ where: { id: certId } });
  }

  async addSkill(userId: string, skillName: string) {
    return this.prisma.userSkill.create({ data: { userId, skill: skillName } });
  }

  async removeSkill(skillId: string, userId: string) {
    const skill = await this.prisma.userSkill.findFirst({ where: { id: skillId, userId } });
    if (!skill) throw new NotFoundException('Skill not found');
    return this.prisma.userSkill.delete({ where: { id: skillId } });
  }
}
