import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommunityDto) {
    const existing = await this.prisma.community.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('A community with this slug already exists');
    }

    const community = await this.prisma.community.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        iconUrl: dto.iconUrl,
        bannerUrl: dto.bannerUrl,
        accessType: dto.accessType ?? 'public',
        memberCount: 1,
      },
    });

    await this.prisma.communityMember.create({
      data: { communityId: community.id, userId },
    });

    await this.prisma.communityModerator.create({
      data: { communityId: community.id, userId },
    });

    return community;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { isActive: true, deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.community.findMany({
        where,
        orderBy: { memberCount: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.community.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async update(id: string, userId: string, dto: UpdateCommunityDto) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }

    const isModerator = await this.prisma.communityModerator.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (!isModerator) {
      throw new ForbiddenException('Only moderators can update this community');
    }

    if (dto.slug && dto.slug !== community.slug) {
      const slugExists = await this.prisma.community.findUnique({ where: { slug: dto.slug } });
      if (slugExists) {
        throw new ConflictException('A community with this slug already exists');
      }
    }

    return this.prisma.community.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }

    const isModerator = await this.prisma.communityModerator.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (!isModerator) {
      throw new ForbiddenException('Only moderators can delete this community');
    }

    await this.prisma.community.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Community deleted' };
  }

  async join(id: string, userId: string) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }

    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (existing) {
      throw new ConflictException('Already a member of this community');
    }

    await this.prisma.communityMember.create({ data: { communityId: id, userId } });
    await this.prisma.community.update({ where: { id }, data: { memberCount: { increment: 1 } } });
    return { message: 'Joined community' };
  }

  async leave(id: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (!member) {
      throw new NotFoundException('Not a member of this community');
    }

    const moderator = await this.prisma.communityModerator.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (moderator) {
      await this.prisma.communityModerator.delete({
        where: { communityId_userId: { communityId: id, userId } },
      });
    }

    await this.prisma.communityMember.delete({
      where: { communityId_userId: { communityId: id, userId } },
    });
    await this.prisma.community.update({ where: { id }, data: { memberCount: { decrement: 1 } } });
    return { message: 'Left community' };
  }

  async addModerator(id: string, userId: string, moderatorUserId: string) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }

    const isOwner = await this.prisma.communityModerator.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (!isOwner) {
      throw new ForbiddenException('Only moderators can add moderators');
    }

    const existing = await this.prisma.communityModerator.findUnique({
      where: { communityId_userId: { communityId: id, userId: moderatorUserId } },
    });
    if (existing) {
      throw new ConflictException('User is already a moderator');
    }

    return this.prisma.communityModerator.create({
      data: { communityId: id, userId: moderatorUserId },
    });
  }

  async removeModerator(id: string, userId: string, moderatorUserId: string) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }

    const isOwner = await this.prisma.communityModerator.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });
    if (!isOwner) {
      throw new ForbiddenException('Only moderators can remove moderators');
    }

    const moderator = await this.prisma.communityModerator.findUnique({
      where: { communityId_userId: { communityId: id, userId: moderatorUserId } },
    });
    if (!moderator) {
      throw new NotFoundException('User is not a moderator');
    }

    await this.prisma.communityModerator.delete({
      where: { communityId_userId: { communityId: id, userId: moderatorUserId } },
    });
    return { message: 'Moderator removed' };
  }

  async getMembers(id: string, page = 1, limit = 20) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }

    const skip = (page - 1) * limit;
    const where = { communityId: id };
    const [data, total] = await Promise.all([
      this.prisma.communityMember.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true } } },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.communityMember.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
