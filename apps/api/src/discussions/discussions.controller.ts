import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { CreateCommentDto, UpdateCommentDto, VotePollDto } from './dto/comment-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a discussion' })
  async create(@CurrentUser() user: any, @Body() dto: CreateDiscussionDto) {
    return { data: await this.discussionsService.create(user.id, dto) };
  }

  @Get()
  @ApiOperation({ summary: 'List discussions' })
  async findAll(
    @Query('communityId') communityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.discussionsService.findAll(communityId, Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discussion details' })
  async findOne(@Param('id') id: string) {
    return { data: await this.discussionsService.findOne(id) };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update discussion' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateDiscussionDto) {
    return { data: await this.discussionsService.update(id, user.id, dto) };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete discussion' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.discussionsService.remove(id, user.id) };
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment' })
  async addComment(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: CreateCommentDto) {
    return { data: await this.discussionsService.addComment(id, user.id, dto) };
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments' })
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.discussionsService.getComments(id, Number(page) || 1, Number(limit) || 50);
  }

  @Put(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCommentDto,
  ) {
    return { data: await this.discussionsService.updateComment(id, commentId, user.id, dto) };
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  async removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return { data: await this.discussionsService.removeComment(id, commentId, user.id) };
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle bookmark' })
  async toggleBookmark(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.discussionsService.toggleBookmark(id, user.id) };
  }

  @Post(':id/polls/:pollId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on a poll' })
  async votePoll(
    @Param('id') id: string,
    @Param('pollId') pollId: string,
    @CurrentUser() user: any,
    @Body() dto: VotePollDto,
  ) {
    return { data: await this.discussionsService.votePoll(id, pollId, user.id, dto) };
  }
}
