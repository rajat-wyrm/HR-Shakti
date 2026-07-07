import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReactionActionDto } from './dto/reaction-action.dto';
import { BookmarkActionDto } from './dto/bookmark-action.dto';
import { ReportActionDto } from './dto/report-action.dto';
import { PaginationQueryDto } from '../network/dto/pagination-query.dto';

@ApiTags('Reactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('reactions')
  @ApiOperation({ summary: 'Toggle reaction (add/remove)' })
  async toggleReaction(@CurrentUser() user: any, @Body() dto: ReactionActionDto) {
    return { data: await this.reactionsService.toggleReaction(user.id, dto.targetType, dto.targetId, dto.type) };
  }

  @Get('reactions/:targetType/:targetId')
  @ApiOperation({ summary: 'Get reactions for content' })
  async getReactions(@Param('targetType') targetType: string, @Param('targetId') targetId: string) {
    return { data: await this.reactionsService.getReactions(targetType, targetId) };
  }

  @Post('bookmarks')
  @ApiOperation({ summary: 'Toggle bookmark' })
  async toggleBookmark(@CurrentUser() user: any, @Body() dto: BookmarkActionDto) {
    return { data: await this.reactionsService.toggleBookmark(user.id, dto.targetType, dto.targetId) };
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get my bookmarks' })
  async getBookmarks(@CurrentUser() user: any, @Query() query: PaginationQueryDto) {
    return this.reactionsService.getBookmarks(user.id, query.page, query.limit);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Report content' })
  async reportContent(@CurrentUser() user: any, @Body() dto: ReportActionDto) {
    return { data: await this.reactionsService.reportContent(user.id, dto.targetType, dto.targetId, dto.reason, dto.description) };
  }
}
