import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectionStatus, Prisma } from '@prisma/client';

@Injectable()
export class NetworkService {
  constructor(private prisma: PrismaService) {}

  async follow(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    await this.ensureUserExists(targetUserId);
    await this.ensureNotBlocked(userId, targetUserId);

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_targetId: { followerId: userId, targetId: targetUserId } },
    });

    if (existing) {
      throw new ConflictException('Already following this user');
    }

    return this.prisma.follow.create({
      data: { followerId: userId, targetId: targetUserId },
    });
  }

  async unfollow(userId: string, targetUserId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_targetId: { followerId: userId, targetId: targetUserId } },
    });

    if (!existing) {
      throw new NotFoundException('Not following this user');
    }

    return this.prisma.follow.delete({
      where: { followerId_targetId: { followerId: userId, targetId: targetUserId } },
    });
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { targetId: userId },
        include: { follower: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { targetId: userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        include: { target: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async requestConnection(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot connect with yourself');
    }

    await this.ensureUserExists(targetUserId);
    await this.ensureNotBlocked(userId, targetUserId);

    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, targetId: targetUserId },
          { requesterId: targetUserId, targetId: userId },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Connection already exists or was requested');
    }

    return this.prisma.connection.create({
      data: { requesterId: userId, targetId: targetUserId, status: 'pending' },
    });
  }

  async acceptConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });

    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.targetId !== userId) throw new ForbiddenException('Not authorized to accept this connection');
    if (connection.status !== 'pending') throw new ConflictException('Connection is not pending');

    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'accepted' },
    });
  }

  async rejectConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });

    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.targetId !== userId) throw new ForbiddenException('Not authorized to reject this connection');
    if (connection.status !== 'pending') throw new ConflictException('Connection is not pending');

    await this.prisma.connection.delete({ where: { id: connectionId } });
    return { message: 'Connection request rejected' };
  }

  async getConnections(userId: string, status?: ConnectionStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.ConnectionWhereInput = {
      OR: [
        { requesterId: userId },
        { targetId: userId },
      ],
    };

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.connection.findMany({
        where,
        include: {
          requester: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true } },
          target: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.connection.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async blockUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    await this.ensureUserExists(targetUserId);

    const existing = await this.prisma.block.findUnique({
      where: { initiatorId_targetId: { initiatorId: userId, targetId: targetUserId } },
    });

    if (existing) {
      throw new ConflictException('User already blocked');
    }

    await this.prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: userId, targetId: targetUserId },
          { followerId: targetUserId, targetId: userId },
        ],
      },
    });

    await this.prisma.connection.deleteMany({
      where: {
        OR: [
          { requesterId: userId, targetId: targetUserId },
          { requesterId: targetUserId, targetId: userId },
        ],
      },
    });

    return this.prisma.block.create({
      data: { initiatorId: userId, targetId: targetUserId },
    });
  }

  async unblockUser(userId: string, targetUserId: string) {
    const existing = await this.prisma.block.findUnique({
      where: { initiatorId_targetId: { initiatorId: userId, targetId: targetUserId } },
    });

    if (!existing) {
      throw new NotFoundException('User not blocked');
    }

    return this.prisma.block.delete({
      where: { initiatorId_targetId: { initiatorId: userId, targetId: targetUserId } },
    });
  }

  async getBlockedUsers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.block.findMany({
        where: { initiatorId: userId },
        include: { target: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.block.count({ where: { initiatorId: userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  }

  private async ensureNotBlocked(userId: string, targetUserId: string) {
    const blocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { initiatorId: userId, targetId: targetUserId },
          { initiatorId: targetUserId, targetId: userId },
        ],
      },
    });

    if (blocked) {
      throw new ForbiddenException('Cannot perform this action due to block');
    }
  }
}
