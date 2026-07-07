import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post('posts')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a blog post' })
  async createPost(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return { data: await this.blogsService.createPost(user.id, dto) };
  }

  @Get('posts')
  @ApiOperation({ summary: 'List blog posts' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: string,
    @Query('authorId') authorId?: string,
  ) {
    return this.blogsService.findAll(Number(page) || 1, Number(limit) || 20, tag, status, authorId);
  }

  @Get('posts/:slug')
  @ApiOperation({ summary: 'Get post by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return { data: await this.blogsService.findBySlug(slug) };
  }

  @Put('posts/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  async updatePost(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdatePostDto) {
    return { data: await this.blogsService.updatePost(id, user.id, dto) };
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  async removePost(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.blogsService.removePost(id, user.id) };
  }

  @Post('posts/:id/vote')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote helpful on a post' })
  async votePost(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.blogsService.votePost(id, user.id) };
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to post' })
  async addComment(@Param('postId') postId: string, @CurrentUser() user: any, @Body() dto: CreateCommentDto) {
    return { data: await this.blogsService.addComment(postId, user.id, dto) };
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'List comments on a post' })
  async findComments(@Param('postId') postId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.blogsService.findComments(postId, Number(page) || 1, Number(limit) || 20);
  }

  @Put('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  async updateComment(@Param('commentId') commentId: string, @CurrentUser() user: any, @Body() dto: UpdateCommentDto) {
    return { data: await this.blogsService.updateComment(commentId, user.id, dto) };
  }

  @Delete('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  async removeComment(@Param('commentId') commentId: string, @CurrentUser() user: any) {
    return { data: await this.blogsService.removeComment(commentId, user.id) };
  }

  @Post('series')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a blog series' })
  async createSeries(@Body() dto: CreateSeriesDto) {
    return { data: await this.blogsService.createSeries(dto) };
  }

  @Get('series')
  @ApiOperation({ summary: 'List blog series' })
  async findAllSeries(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.blogsService.findAllSeries(Number(page) || 1, Number(limit) || 20);
  }

  @Get('series/:slug')
  @ApiOperation({ summary: 'Get series by slug' })
  async findSeriesBySlug(@Param('slug') slug: string) {
    return { data: await this.blogsService.findSeriesBySlug(slug) };
  }

  @Put('series/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a series' })
  async updateSeries(@Param('id') id: string, @Body() dto: UpdateSeriesDto) {
    return { data: await this.blogsService.updateSeries(id, dto) };
  }

  @Delete('series/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a series' })
  async removeSeries(@Param('id') id: string) {
    return { data: await this.blogsService.removeSeries(id) };
  }

  @Post('series/:id/posts')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Add post to series' })
  async addPostToSeries(@Param('id') id: string, @Body() body: { postId: string; order?: number }) {
    return { data: await this.blogsService.addPostToSeries(id, body.postId, body.order) };
  }

  @Delete('series/:id/posts/:postId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove post from series' })
  async removePostFromSeries(@Param('id') id: string, @Param('postId') postId: string) {
    return { data: await this.blogsService.removePostFromSeries(id, postId) };
  }
}
