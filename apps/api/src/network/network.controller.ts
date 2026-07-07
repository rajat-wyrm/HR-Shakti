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
