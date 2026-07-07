import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  private toSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = this.toSlug(base);
    let i = 1;
    while (await this.prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${this.toSlug(base)}-${i++}`;
    }
    return slug;
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const slug = await this.uniqueSlug(dto.title);
    const data: any = {
      authorId: userId,
      title: dto.title,
      slug,
      content: dto.content,
    };
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.status) data.status = dto.status;
    if (dto.status === 'published') data.publishedAt = new Date();

    return this.prisma.blogPost.create({
      data,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async findAll(page = 1, limit = 20, tag?: string, status?: string, authorId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (!status && !authorId) where.status = 'published';
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (tag) where.tags = { array_contains: tag };

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        series: {
          include: { series: true },
        },
        _count: { select: { comments: true } },
      },
    });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');

    await this.prisma.blogPost.update({ where: { id: post.id }, data: { readCount: { increment: 1 } } });
    return post;
  }

  async findById(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.findById(id);
    if (post.authorId !== userId) throw new ForbiddenException('Only the author can update this post');

    const data: any = {};
    if (dto.title !== undefined) { data.title = dto.title; data.slug = await this.uniqueSlug(dto.title); }
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'published' && !post.publishedAt) data.publishedAt = new Date();
    }

    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async removePost(id: string, userId: string) {
    const post = await this.findById(id);
    if (post.authorId !== userId) throw new ForbiddenException('Only the author can delete this post');

    await this.prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Post deleted' };
  }

  async votePost(id: string, _userId: string) {
    const post = await this.findById(id);
    await this.prisma.blogPost.update({ where: { id: post.id }, data: { helpfulCount: { increment: 1 } } });
    return { helpful: true };
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.findById(postId);
    const comment = await this.prisma.blogComment.create({
      data: { postId: post.id, authorId: userId, content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await this.prisma.blogPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  async findComments(postId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { postId, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.blogComment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      this.prisma.blogComment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateComment(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.blogComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.deletedAt) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Only the author can update this comment');

    return this.prisma.blogComment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async removeComment(commentId: string, userId: string) {
    const comment = await this.prisma.blogComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.deletedAt) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Only the author can delete this comment');

    await this.prisma.blogComment.update({ where: { id: commentId }, data: { deletedAt: new Date() } });
    await this.prisma.blogPost.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });
    return { message: 'Comment deleted' };
  }

  async createSeries(dto: CreateSeriesDto) {
    const slug = await this.uniqueSlug(dto.title);
    return this.prisma.blogSeries.create({
      data: { title: dto.title, slug, description: dto.description, coverImageUrl: dto.coverImageUrl },
    });
  }

  async findAllSeries(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.blogSeries.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { posts: true } } },
      }),
      this.prisma.blogSeries.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findSeriesBySlug(slug: string) {
    const series = await this.prisma.blogSeries.findUnique({
      where: { slug },
      include: {
        posts: {
          orderBy: { order: 'asc' },
          include: {
            post: {
              include: {
                author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });
    if (!series) throw new NotFoundException('Series not found');
    return series;
  }

  async updateSeries(id: string, dto: UpdateSeriesDto) {
    const series = await this.prisma.blogSeries.findUnique({ where: { id } });
    if (!series) throw new NotFoundException('Series not found');

    const data: any = {};
    if (dto.title !== undefined) { data.title = dto.title; data.slug = await this.uniqueSlug(dto.title); }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;

    return this.prisma.blogSeries.update({ where: { id }, data });
  }

  async removeSeries(id: string) {
    const series = await this.prisma.blogSeries.findUnique({ where: { id } });
    if (!series) throw new NotFoundException('Series not found');

    await this.prisma.blogSeries.delete({ where: { id } });
    return { message: 'Series deleted' };
  }

  async addPostToSeries(seriesId: string, postId: string, order?: number) {
    const series = await this.prisma.blogSeries.findUnique({ where: { id: seriesId } });
    if (!series) throw new NotFoundException('Series not found');

    const post = await this.findById(postId);

    const maxOrder = await this.prisma.blogSeriesPost.findFirst({
      where: { seriesId },
      orderBy: { order: 'desc' },
    });

    return this.prisma.blogSeriesPost.create({
      data: { seriesId, postId: post.id, order: order ?? (maxOrder ? maxOrder.order + 1 : 1) },
      include: {
        series: true,
        post: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async removePostFromSeries(seriesId: string, postId: string) {
    const link = await this.prisma.blogSeriesPost.findUnique({
      where: { seriesId_postId: { seriesId, postId } },
    });
    if (!link) throw new NotFoundException('Post not found in series');

    await this.prisma.blogSeriesPost.delete({ where: { id: link.id } });
    return { message: 'Post removed from series' };
  }
}
