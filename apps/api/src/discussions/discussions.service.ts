import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { CreateCommentDto, UpdateCommentDto, VotePollDto } from './dto/comment-vote.dto';

@Injectable()
export class DiscussionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDiscussionDto) {
    const community = await this.prisma.community.findUnique({ where: { id: dto.communityId } });
    if (!community || community.deletedAt) throw new NotFoundException('Community not found');

    if (community.accessType !== 'public') {
      const member = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: dto.communityId, userId } },
      });
      if (!member) throw new ForbiddenException('You are not a member of this community');
    }

    const discussion = await this.prisma.discussion.create({
      data: {
        communityId: dto.communityId,
        authorId: userId,
        title: dto.title,
        content: dto.content,
        contentType: dto.contentType,
        tags: dto.tags ?? [],
        isAnonymous: dto.isAnonymous ?? false,
      },
    });

    await this.prisma.community.update({
      where: { id: dto.communityId },
      data: { discussionCount: { increment: 1 } },
    });

    if (dto.poll) {
      const poll = await this.prisma.discussionPoll.create({
        data: {
          discussionId: discussion.id,
          question: dto.poll.question,
          isMultiple: dto.poll.isMultiple ?? false,
          options: {
            create: dto.poll.options.map((o) => ({ label: o.label })),
          },
        },
        include: { options: true },
      });
      return { ...discussion, poll };
    }

    return discussion;
  }

  async findAll(communityId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (communityId) where.communityId = communityId;

    const [data, total] = await Promise.all([
      this.prisma.discussion.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.discussion.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        polls: { include: { options: true } },
        _count: { select: { comments: true } },
      },
    });
    if (!discussion || discussion.deletedAt) throw new NotFoundException('Discussion not found');

    await this.prisma.discussion.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return discussion;
  }

  async update(id: string, userId: string, dto: UpdateDiscussionDto) {
    const discussion = await this.prisma.discussion.findUnique({ where: { id } });
    if (!discussion || discussion.deletedAt) throw new NotFoundException('Discussion not found');

    const isAuthor = discussion.authorId === userId;
    if (!isAuthor) {
      const member = await this.prisma.communityModerator.findFirst({
        where: { communityId: discussion.communityId, userId },
      });
      if (!member) throw new ForbiddenException('Only the author or a moderator can update this discussion');
    }

    const updateData: any = { ...dto };
    if (dto.isPinned !== undefined && !isAuthor) {
      const member = await this.prisma.communityModerator.findFirst({
        where: { communityId: discussion.communityId, userId },
      });
      if (!member) throw new ForbiddenException('Only moderators can pin discussions');
    }
    if (dto.isLocked !== undefined && !isAuthor) {
      const member = await this.prisma.communityModerator.findFirst({
        where: { communityId: discussion.communityId, userId },
      });
      if (!member) throw new ForbiddenException('Only moderators can lock discussions');
    }

    return this.prisma.discussion.update({ where: { id }, data: updateData });
  }

  async remove(id: string, userId: string) {
    const discussion = await this.prisma.discussion.findUnique({ where: { id } });
    if (!discussion || discussion.deletedAt) throw new NotFoundException('Discussion not found');

    const isAuthor = discussion.authorId === userId;
    if (!isAuthor) {
      const member = await this.prisma.communityModerator.findFirst({
        where: { communityId: discussion.communityId, userId },
      });
      if (!member) throw new ForbiddenException('Only the author or a moderator can delete this discussion');
    }

    await this.prisma.discussion.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.community.update({
      where: { id: discussion.communityId },
      data: { discussionCount: { decrement: 1 } },
    });
    return { message: 'Discussion deleted' };
  }

  async addComment(discussionId: string, userId: string, dto: CreateCommentDto) {
    const discussion = await this.prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!discussion || discussion.deletedAt) throw new NotFoundException('Discussion not found');
    if (discussion.isLocked) throw new ForbiddenException('Discussion is locked');

    let path: string | undefined;
    let depth = 0;

    if (dto.parentId) {
      const parent = await this.prisma.discussionComment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.deletedAt) throw new NotFoundException('Parent comment not found');
      if (parent.discussionId !== discussionId) throw new ForbiddenException('Parent comment is from another discussion');

      const pathPrefix = parent.path ?? parent.id;
      path = `${pathPrefix}.${parent.id}`;
      depth = parent.depth + 1;
    }

    const comment = await this.prisma.discussionComment.create({
      data: {
        discussionId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId,
        path: path ?? null,
        depth,
        isAnonymous: dto.isAnonymous ?? false,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (!path) {
      await this.prisma.discussionComment.update({
        where: { id: comment.id },
        data: { path: comment.id },
      });
    }

    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  async getComments(discussionId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.discussionComment.findMany({
        where: { discussionId, deletedAt: null },
        orderBy: { path: 'asc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      this.prisma.discussionComment.count({ where: { discussionId, deletedAt: null } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateComment(discussionId: string, commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.discussionComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.deletedAt) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('You can only edit your own comments');

    return this.prisma.discussionComment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async removeComment(discussionId: string, commentId: string, userId: string) {
    const comment = await this.prisma.discussionComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.deletedAt) throw new NotFoundException('Comment not found');

    if (comment.authorId !== userId) {
      const discussion = await this.prisma.discussion.findUnique({ where: { id: discussionId } });
      if (!discussion || discussion.deletedAt) throw new NotFoundException('Discussion not found');
      const member = await this.prisma.communityModerator.findFirst({
        where: { communityId: discussion.communityId, userId },
      });
      if (!member) throw new ForbiddenException('Only the author or a moderator can delete this comment');
    }

    await this.prisma.discussionComment.update({ where: { id: commentId }, data: { deletedAt: new Date() } });
    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { commentCount: { decrement: 1 } },
    });
    return { message: 'Comment deleted' };
  }

  async toggleBookmark(discussionId: string, userId: string) {
    const discussion = await this.prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!discussion || discussion.deletedAt) throw new NotFoundException('Discussion not found');

    const existing = await this.prisma.discussionBookmark.findUnique({
      where: { discussionId_userId: { discussionId, userId } },
    });

    if (existing) {
      await this.prisma.discussionBookmark.delete({ where: { id: existing.id } });
      await this.prisma.discussion.update({
        where: { id: discussionId },
        data: { bookmarkCount: { decrement: 1 } },
      });
      return { bookmarked: false };
    }

    await this.prisma.discussionBookmark.create({ data: { discussionId, userId } });
    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { bookmarkCount: { increment: 1 } },
    });
    return { bookmarked: true };
  }

  async votePoll(discussionId: string, pollId: string, userId: string, dto: VotePollDto) {
    const poll = await this.prisma.discussionPoll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.discussionId !== discussionId) throw new NotFoundException('Poll not found in this discussion');
    if (poll.expiresAt && new Date() > poll.expiresAt) throw new ForbiddenException('Poll has expired');

    const option = poll.options.find((o) => o.id === dto.optionId);
    if (!option) throw new NotFoundException('Option not found');

    if (!poll.isMultiple) {
      const existing = await this.prisma.discussionPollVote.findFirst({
        where: { option: { pollId }, userId },
      });
      if (existing) {
        await this.prisma.discussionPollVote.delete({ where: { id: existing.id } });
        await this.prisma.discussionPollOption.update({
          where: { id: existing.optionId },
          data: { voteCount: { decrement: 1 } },
        });
      }
    } else {
      const existing = await this.prisma.discussionPollVote.findUnique({
        where: { optionId_userId: { optionId: dto.optionId, userId } },
      });
      if (existing) {
        await this.prisma.discussionPollVote.delete({ where: { id: existing.id } });
        await this.prisma.discussionPollOption.update({
          where: { id: existing.optionId },
          data: { voteCount: { decrement: 1 } },
        });
        return { voted: false, optionId: dto.optionId };
      }
    }

    await this.prisma.discussionPollVote.create({ data: { optionId: dto.optionId, userId } });
    await this.prisma.discussionPollOption.update({
      where: { id: dto.optionId },
      data: { voteCount: { increment: 1 } },
    });
    return { voted: true, optionId: dto.optionId };
  }
}
