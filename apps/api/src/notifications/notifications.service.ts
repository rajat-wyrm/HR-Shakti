import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreatePreferenceDto, UpdatePreferenceDto } from './dto/notification-preference.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        data: dto.data ?? {},
        link: dto.link,
        channel: (dto.channel ?? 'in_app') as any,
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount } };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);
    if (notification.isRead) return notification;

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { message: 'All notifications marked as read' };
  }

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  async upsertPreference(userId: string, type: string, dto: UpdatePreferenceDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type } },
      update: {
        ...(dto.channel !== undefined ? { channel: dto.channel as any } : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
      },
      create: {
        userId,
        type,
        channel: (dto.channel ?? 'in_app') as any,
        enabled: dto.enabled ?? true,
      },
    });
  }
}
