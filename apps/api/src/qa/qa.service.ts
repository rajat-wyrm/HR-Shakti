import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateAnswerDto, UpdateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class QaService {
  constructor(private readonly prisma: PrismaService) {}

  private toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private async ensureTag(name: string) {
    const slug = this.toSlug(name);
    return this.prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
  }

  async createQuestion(userId: string, dto: CreateQuestionDto) {
    const data: any = {
      authorId: userId,
      title: dto.title,
      content: dto.content,
    };

    if (dto.bounty) {
      data.bounty = dto.bounty;
      if (dto.bountyExpiresAt) data.bountyExpiresAt = new Date(dto.bountyExpiresAt);
    }

    const question = await this.prisma.question.create({ data });

    if (dto.tags?.length) {
      for (const name of dto.tags) {
        const tag = await this.ensureTag(name);
        await this.prisma.questionTag.create({ data: { questionId: question.id, tagId: tag.id } });
        await this.prisma.tag.update({ where: { id: tag.id }, data: { questionCount: { increment: 1 } } });
      }
    }

    return this.prisma.question.findUnique({
      where: { id: question.id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  async findAll(page = 1, limit = 20, tag?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (tag) {
      const tagRecord = await this.prisma.tag.findUnique({ where: { slug: tag } });
      if (tagRecord) {
        where.tags = { some: { tagId: tagRecord.id } };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        orderBy: [{ bounty: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          tags: { include: { tag: true } },
          _count: { select: { answers: true } },
        },
      }),
      this.prisma.question.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        answers: {
          where: { deletedAt: null },
          orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }],
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { answers: true } },
      },
    });
    if (!question || question.deletedAt) throw new NotFoundException('Question not found');

    await this.prisma.question.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return question;
  }

  async updateQuestion(id: string, userId: string, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question || question.deletedAt) throw new NotFoundException('Question not found');
    if (question.authorId !== userId) throw new ForbiddenException('Only the author can update this question');

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.question.update({ where: { id }, data });

    if (dto.tags) {
      await this.prisma.questionTag.deleteMany({ where: { questionId: id } });
      for (const name of dto.tags) {
        const tag = await this.ensureTag(name);
        await this.prisma.questionTag.create({ data: { questionId: id, tagId: tag.id } });
        await this.prisma.tag.update({ where: { id: tag.id }, data: { questionCount: { increment: 1 } } });
      }
    }

    return updated;
  }

  async removeQuestion(id: string, userId: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question || question.deletedAt) throw new NotFoundException('Question not found');
    if (question.authorId !== userId) throw new ForbiddenException('Only the author can delete this question');

    await this.prisma.question.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Question deleted' };
  }

  async createAnswer(questionId: string, userId: string, dto: CreateAnswerDto) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.deletedAt) throw new NotFoundException('Question not found');

    const answer = await this.prisma.answer.create({
      data: { questionId, authorId: userId, content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await this.prisma.question.update({
      where: { id: questionId },
      data: { answerCount: { increment: 1 } },
    });

    return answer;
  }

  async updateAnswer(questionId: string, answerId: string, userId: string, dto: UpdateAnswerDto) {
    const answer = await this.prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer || answer.deletedAt) throw new NotFoundException('Answer not found');
    if (answer.authorId !== userId) throw new ForbiddenException('Only the author can update this answer');
    if (answer.questionId !== questionId) throw new NotFoundException('Answer not found in this question');

    return this.prisma.answer.update({
      where: { id: answerId },
      data: { content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async removeAnswer(questionId: string, answerId: string, userId: string) {
    const answer = await this.prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer || answer.deletedAt) throw new NotFoundException('Answer not found');
    if (answer.authorId !== userId) throw new ForbiddenException('Only the author can delete this answer');
    if (answer.questionId !== questionId) throw new NotFoundException('Answer not found in this question');

    await this.prisma.answer.update({ where: { id: answerId }, data: { deletedAt: new Date() } });
    await this.prisma.question.update({
      where: { id: questionId },
      data: { answerCount: { decrement: 1 } },
    });
    return { message: 'Answer deleted' };
  }

  async acceptAnswer(questionId: string, answerId: string, userId: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.deletedAt) throw new NotFoundException('Question not found');
    if (question.authorId !== userId) throw new ForbiddenException('Only the question author can accept an answer');

    const answer = await this.prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer || answer.deletedAt) throw new NotFoundException('Answer not found');
    if (answer.questionId !== questionId) throw new NotFoundException('Answer not found in this question');

    await this.prisma.$transaction([
      this.prisma.question.update({
        where: { id: questionId },
        data: { acceptedAnswerId: answerId, status: 'answered' },
      }),
      this.prisma.answer.updateMany({
        where: { questionId, isAccepted: true },
        data: { isAccepted: false },
      }),
      this.prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      }),
    ]);

    return { accepted: true, answerId };
  }

  async voteQuestion(id: string, userId: string, type: 'helpful' | 'insightful' | 'from_exp') {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question || question.deletedAt) throw new NotFoundException('Question not found');

    const field = type === 'helpful' ? 'helpfulCount' : type === 'insightful' ? 'insightfulCount' : 'fromExpCount';
    await this.prisma.question.update({ where: { id }, data: { [field]: { increment: 1 } } });
    return { [type]: true };
  }

  async voteAnswer(questionId: string, answerId: string, userId: string, type: 'helpful' | 'insightful' | 'from_exp') {
    const answer = await this.prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer || answer.deletedAt) throw new NotFoundException('Answer not found');
    if (answer.questionId !== questionId) throw new NotFoundException('Answer not found in this question');

    const field = type === 'helpful' ? 'helpfulCount' : type === 'insightful' ? 'insightfulCount' : 'fromExpCount';
    await this.prisma.answer.update({ where: { id: answerId }, data: { [field]: { increment: 1 } } });
    return { [type]: true };
  }

  async findTags(category?: string) {
    const where: any = {};
    if (category) where.category = category;
    return this.prisma.tag.findMany({ where, orderBy: { questionCount: 'desc' } });
  }
}
