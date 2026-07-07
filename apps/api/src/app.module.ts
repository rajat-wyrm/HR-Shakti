import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NetworkModule } from './network/network.module';
import { ReactionsModule } from './reactions/reactions.module';
import { CommunitiesModule } from './communities/communities.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { QaModule } from './qa/qa.module';
import { BlogsModule } from './blogs/blogs.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    NetworkModule,
    ReactionsModule,
    CommunitiesModule,
    OrganizationsModule,
    DiscussionsModule,
    QaModule,
    BlogsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
