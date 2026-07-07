# Network Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Network module — follow/unfollow, connection request/accept/reject, block/unblock — for the HR professional social layer.

**Architecture:** NestJS feature module following auth/users patterns: `network.module.ts`, `network.service.ts`, `network.controller.ts`, `dto/` directory, JWT auth guards on all endpoints, PrismaService for DB access.

**Tech Stack:** NestJS, Prisma, class-validator, class-transformer, @nestjs/passport

---

### Task 1: Create NetworkModule scaffold

**Files:**
- Create: `apps/api/src/network/network.module.ts`
- Create: `apps/api/src/network/network.service.ts`
- Create: `apps/api/src/network/network.controller.ts`
- Create: `apps/api/src/network/dto/connection-action.dto.ts`
- Create: `apps/api/src/network/dto/pagination-query.dto.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create pagination DTO**

```typescript
// apps/api/src/network/dto/pagination-query.dto.ts
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

- [ ] **Step 2: Create connection action DTO**

```typescript
// apps/api/src/network/dto/connection-action.dto.ts
import { IsEnum } from 'class-validator';
import { ConnectionStatus } from '@prisma/client';

export class ConnectionStatusQueryDto {
  @IsOptional()
  @IsEnum(ConnectionStatus)
  status?: ConnectionStatus;
}
```

- [ ] **Step 3: Create NetworkService**

```typescript
// apps/api/src/network/network.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectionStatus, Prisma } from '@prisma/client';

@Injectable()
export class NetworkService {
  constructor(private prisma: PrismaService) {}

  // ─── Follow ───────────────────────────────────────────────

  async follow(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    await this.ensureUserExists(targetUserId);
    await this.ensureNotBlocked(userId, targetUserId);

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_targetId: { followerId: userId, targetId: targetUserId } },
    });

    if (existing) {
      throw new ConflictException('Already following this user');
    }

    return this.prisma.follow.create({
      data: { followerId: userId, targetId: targetUserId },
    });
  }

  async unfollow(userId: string, targetUserId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_targetId: { followerId: userId, targetId: targetUserId } },
    });

    if (!existing) {
      throw new NotFoundException('Not following this user');
    }

    return this.prisma.follow.delete({
      where: { followerId_targetId: { followerId: userId, targetId: targetUserId } },
    });
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { targetId: userId },
        include: { follower: { select: { id: true, firstName: true, lastName: true, avatar: true, headline: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { targetId: userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        include: { target: { select: { id: true, firstName: true, lastName: true, avatar: true, headline: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Connections ──────────────────────────────────────────

  async requestConnection(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot connect with yourself');
    }

    await this.ensureUserExists(targetUserId);
    await this.ensureNotBlocked(userId, targetUserId);

    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, targetId: targetUserId },
          { requesterId: targetUserId, targetId: userId },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Connection already exists or was requested');
    }

    return this.prisma.connection.create({
      data: { requesterId: userId, targetId: targetUserId, status: 'pending' },
    });
  }

  async acceptConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });

    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.targetId !== userId) throw new ForbiddenException('Not authorized to accept this connection');
    if (connection.status !== 'pending') throw new ConflictException('Connection is not pending');

    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'accepted' },
    });
  }

  async rejectConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });

    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.targetId !== userId) throw new ForbiddenException('Not authorized to reject this connection');
    if (connection.status !== 'pending') throw new ConflictException('Connection is not pending');

    await this.prisma.connection.delete({ where: { id: connectionId } });
    return { message: 'Connection request rejected' };
  }

  async getConnections(userId: string, status?: ConnectionStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.ConnectionWhereInput = {
      OR: [
        { requesterId: userId },
        { targetId: userId },
      ],
    };

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.connection.findMany({
        where,
        include: {
          requester: { select: { id: true, firstName: true, lastName: true, avatar: true, headline: true } },
          target: { select: { id: true, firstName: true, lastName: true, avatar: true, headline: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.connection.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Block ────────────────────────────────────────────────

  async blockUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    await this.ensureUserExists(targetUserId);

    const existing = await this.prisma.block.findUnique({
      where: { initiatorId_targetId: { initiatorId: userId, targetId: targetUserId } },
    });

    if (existing) {
      throw new ConflictException('User already blocked');
    }

    // Remove any follow/connection relationships
    await this.prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: userId, targetId: targetUserId },
          { followerId: targetUserId, targetId: userId },
        ],
      },
    });

    await this.prisma.connection.deleteMany({
      where: {
        OR: [
          { requesterId: userId, targetId: targetUserId },
          { requesterId: targetUserId, targetId: userId },
        ],
      },
    });

    return this.prisma.block.create({
      data: { initiatorId: userId, targetId: targetUserId },
    });
  }

  async unblockUser(userId: string, targetUserId: string) {
    const existing = await this.prisma.block.findUnique({
      where: { initiatorId_targetId: { initiatorId: userId, targetId: targetUserId } },
    });

    if (!existing) {
      throw new NotFoundException('User not blocked');
    }

    return this.prisma.block.delete({
      where: { initiatorId_targetId: { initiatorId: userId, targetId: targetUserId } },
    });
  }

  async getBlockedUsers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.block.findMany({
        where: { initiatorId: userId },
        include: { target: { select: { id: true, firstName: true, lastName: true, avatar: true, headline: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.block.count({ where: { initiatorId: userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Helpers ──────────────────────────────────────────────

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  }

  private async ensureNotBlocked(userId: string, targetUserId: string) {
    const blocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { initiatorId: userId, targetId: targetUserId },
          { initiatorId: targetUserId, targetId: userId },
        ],
      },
    });

    if (blocked) {
      throw new ForbiddenException('Cannot perform this action due to block');
    }
  }
}
```

- [ ] **Step 4: Create NetworkController**

```typescript
// apps/api/src/network/network.controller.ts
import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NetworkService } from './network.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConnectionStatusQueryDto } from './dto/connection-action.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@ApiTags('Network')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  // ─── Follow ───────────────────────────────────────────────

  @Post('follow/:userId')
  @ApiOperation({ summary: 'Follow a user' })
  async follow(@CurrentUser() user: any, @Param('userId') targetUserId: string) {
    return { data: await this.networkService.follow(user.id, targetUserId) };
  }

  @Delete('follow/:userId')
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollow(@CurrentUser() user: any, @Param('userId') targetUserId: string) {
    return { data: await this.networkService.unfollow(user.id, targetUserId) };
  }

  @Get('followers')
  @ApiOperation({ summary: 'Get my followers' })
  async getFollowers(@CurrentUser() user: any, @Query() query: PaginationQueryDto) {
    return this.networkService.getFollowers(user.id, query.page, query.limit);
  }

  @Get('following')
  @ApiOperation({ summary: 'Get who I follow' })
  async getFollowing(@CurrentUser() user: any, @Query() query: PaginationQueryDto) {
    return this.networkService.getFollowing(user.id, query.page, query.limit);
  }

  // ─── Connections ──────────────────────────────────────────

  @Post('connections/request/:userId')
  @ApiOperation({ summary: 'Send a connection request' })
  async requestConnection(@CurrentUser() user: any, @Param('userId') targetUserId: string) {
    return { data: await this.networkService.requestConnection(user.id, targetUserId) };
  }

  @Put('connections/:id/accept')
  @ApiOperation({ summary: 'Accept a connection request' })
  async acceptConnection(@CurrentUser() user: any, @Param('id') connectionId: string) {
    return { data: await this.networkService.acceptConnection(user.id, connectionId) };
  }

  @Put('connections/:id/reject')
  @ApiOperation({ summary: 'Reject a connection request' })
  async rejectConnection(@CurrentUser() user: any, @Param('id') connectionId: string) {
    return { data: await this.networkService.rejectConnection(user.id, connectionId) };
  }

  @Get('connections')
  @ApiOperation({ summary: 'List my connections' })
  async getConnections(
    @CurrentUser() user: any,
    @Query() statusQuery: ConnectionStatusQueryDto,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.networkService.getConnections(user.id, statusQuery.status, pagination.page, pagination.limit);
  }

  // ─── Block ────────────────────────────────────────────────

  @Post('block/:userId')
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(@CurrentUser() user: any, @Param('userId') targetUserId: string) {
    return { data: await this.networkService.blockUser(user.id, targetUserId) };
  }

  @Delete('block/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  async unblockUser(@CurrentUser() user: any, @Param('userId') targetUserId: string) {
    return { data: await this.networkService.unblockUser(user.id, targetUserId) };
  }

  @Get('blocked')
  @ApiOperation({ summary: 'List blocked users' })
  async getBlockedUsers(@CurrentUser() user: any, @Query() query: PaginationQueryDto) {
    return this.networkService.getBlockedUsers(user.id, query.page, query.limit);
  }
}
```

- [ ] **Step 5: Create NetworkModule**

```typescript
// apps/api/src/network/network.module.ts
import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';

@Module({
  controllers: [NetworkController],
  providers: [NetworkService],
  exports: [NetworkService],
})
export class NetworkModule {}
```

- [ ] **Step 6: Import NetworkModule in AppModule**

```typescript
// apps/api/src/app.module.ts
import { NetworkModule } from './network/network.module';

// Add to imports array:
NetworkModule,
```

---

### Task 2: Build and Verify Network Module

- [ ] **Step 1: Build the API**

Run: `pnpm build`
Expected: Compilation succeeds with no errors.

- [ ] **Step 2: Start the API server**

Run: `pnpm --filter @hrshakti/api dev`
Expected: Server starts on port 4000.

- [ ] **Step 3: Smoke test follow endpoint**

```bash
# Login as test user
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@hrshakti.com","password":"Test@1234"}' | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')
echo "TOKEN: $TOKEN"

# Try following self (should fail 400)
curl -s -X POST http://localhost:4000/api/v1/network/follow/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $TOKEN"

# Get following (should be empty)
curl -s http://localhost:4000/api/v1/network/following \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 4: Create a second user and test follow**

```bash
# Register a second user
curl -s -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"Test@1234","firstName":"User","lastName":"Two"}'

# Get user2's ID from DB
USER2_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM \"User\" WHERE email='user2@test.com';" | tr -d ' ')
echo "USER2_ID: $USER2_ID"

# Follow user2
curl -s -X POST "http://localhost:4000/api/v1/network/follow/$USER2_ID" \
  -H "Authorization: Bearer $TOKEN"

# Check following (should have 1)
curl -s http://localhost:4000/api/v1/network/following \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 5: Test connection endpoints**

```bash
# Login as user2
TOKEN2=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"Test@1234"}' | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')

# Get user1 ID
USER1_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM \"User\" WHERE email='test@hrshakti.com';" | tr -d ' ')
echo "USER1_ID: $USER1_ID"

# user2 sends connection request to user1
CONN_RESULT=$(curl -s -X POST "http://localhost:4000/api/v1/network/connections/request/$USER1_ID" \
  -H "Authorization: Bearer $TOKEN2")
echo "CONNECTION REQUEST: $CONN_RESULT"

# Get connection ID from the response
CONN_ID=$(echo "$CONN_RESULT" | sed 's/.*"id":"\([^"]*\)".*/\1/')
echo "CONN_ID: $CONN_ID"

# user1 accepts the connection
curl -s -X PUT "http://localhost:4000/api/v1/network/connections/$CONN_ID/accept" \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 6: Test block endpoint**

```bash
# user1 blocks user2
curl -s -X POST "http://localhost:4000/api/v1/network/block/$USER2_ID" \
  -H "Authorization: Bearer $TOKEN"

# Check blocked list
curl -s http://localhost:4000/api/v1/network/blocked \
  -H "Authorization: Bearer $TOKEN"

# Unblock
curl -s -X DELETE "http://localhost:4000/api/v1/network/block/$USER2_ID" \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 7: Verify Swagger docs**

Open `http://localhost:4000/api/docs` and confirm the Network tag shows all 11 endpoints.
