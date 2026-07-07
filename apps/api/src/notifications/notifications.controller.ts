import {
  Controller, Get, Post, Put, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdatePreferenceDto } from './dto/notification-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification (system)' })
  async create(@CurrentUser() user: any, @Body() dto: CreateNotificationDto) {
    return { data: await this.notificationsService.create(user.id, dto) };
  }

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findAll(user.id, Number(page) || 1, Number(limit) || 20, unreadOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification detail' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.notificationsService.findOne(id, user.id) };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.notificationsService.markAsRead(id, user.id) };
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@CurrentUser() user: any) {
    return { data: await this.notificationsService.getPreferences(user.id) };
  }

  @Put('preferences/:type')
  @ApiOperation({ summary: 'Upsert notification preference' })
  async upsertPreference(@Param('type') type: string, @CurrentUser() user: any, @Body() dto: UpdatePreferenceDto) {
    return { data: await this.notificationsService.upsertPreference(user.id, type, dto) };
  }
}
