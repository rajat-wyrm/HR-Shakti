import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReactionType } from '@prisma/client';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleReaction(userId: string, targetType: string, targetId: string, type: ReactionType) {
    const existing = await this.prisma.contentReaction.findUnique({
      where: { userId_targetType_targetId_type: { userId, targetType, targetId, type } },
    });

    if (existing) {
      await this.prisma.contentReaction.delete({ where: { id: existing.id } });
      return { action: 'removed' };
    }

    const reaction = await this.prisma.contentReaction.create({
      data: { userId, targetType, targetId, type },
    });

    return { action: 'added', reaction };
  }

  async getReactions(targetType: string, targetId: string) {
    const reactions = await this.prisma.contentReaction.findMany({
      where: { targetType, targetId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const summary: Record<string, number> = {};
    for (const r of reactions) {
      summary[r.type] = (summary[r.type] || 0) + 1;
    }

    return { reactions, summary };
  }

  async toggleBookmark(userId: string, targetType: string, targetId: string) {
    const existing = await this.prisma.contentBookmark.findUnique({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
    });

    if (existing) {
      await this.prisma.contentBookmark.delete({ where: { id: existing.id } });
      return { action: 'removed' };
    }

    const bookmark = await this.prisma.contentBookmark.create({
      data: { userId, targetType, targetId },
    });

    return { action: 'added', bookmark };
  }

  async getBookmarks(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.contentBookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contentBookmark.count({ where: { userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async reportContent(reporterId: string, targetType: string, targetId: string, reason: string, description?: string) {
    const existing = await this.prisma.contentReport.findFirst({
      where: { reporterId, targetType, targetId },
    });

    if (existing) {
      const report = await this.prisma.contentReport.update({
        where: { id: existing.id },
        data: { reason, description },
      });
      return { action: 'updated', report };
    }

    const report = await this.prisma.contentReport.create({
      data: { reporterId, targetType, targetId, reason, description },
    });

    return { action: 'created', report };
  }
}
