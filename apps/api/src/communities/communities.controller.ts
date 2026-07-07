import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../network/dto/pagination-query.dto';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a community' })
  async create(@CurrentUser() user: any, @Body() dto: CreateCommunityDto) {
    return { data: await this.communitiesService.create(user.id, dto) };
  }

  @Get()
  @ApiOperation({ summary: 'List communities (public)' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.communitiesService.findAll(query.page, query.limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get community details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return { data: await this.communitiesService.findBySlug(slug) };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update community (owner/moderator)' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateCommunityDto) {
    return { data: await this.communitiesService.update(id, user.id, dto) };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete community (owner only)' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.communitiesService.remove(id, user.id) };
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a community' })
  async join(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.communitiesService.join(id, user.id) };
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a community' })
  async leave(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.communitiesService.leave(id, user.id) };
  }

  @Post(':id/moderators')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a moderator (owner only)' })
  async addModerator(@Param('id') id: string, @CurrentUser() user: any, @Body('userId') moderatorUserId: string) {
    return { data: await this.communitiesService.addModerator(id, user.id, moderatorUserId) };
  }

  @Delete(':id/moderators/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a moderator (owner only)' })
  async removeModerator(@Param('id') id: string, @CurrentUser() user: any, @Param('userId') moderatorUserId: string) {
    return { data: await this.communitiesService.removeModerator(id, user.id, moderatorUserId) };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List community members' })
  async getMembers(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.communitiesService.getMembers(id, query.page, query.limit);
  }
}
