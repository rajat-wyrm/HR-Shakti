import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ClaimOrganizationDto, UpdateMemberRoleDto } from './dto/org-action.dto';
import { VerifyClaimDto } from './dto/verify-claim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../network/dto/pagination-query.dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an organization' })
  async create(@CurrentUser() user: any, @Body() dto: CreateOrganizationDto) {
    return { data: await this.organizationsService.create(user.id, dto) };
  }

  @Get()
  @ApiOperation({ summary: 'List organizations (public)' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.organizationsService.findAll(query.page, query.limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get organization details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return { data: await this.organizationsService.findBySlug(slug) };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization (admin only)' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateOrganizationDto) {
    return { data: await this.organizationsService.update(id, user.id, dto) };
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start organization claim process' })
  async claim(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: ClaimOrganizationDto) {
    return { data: await this.organizationsService.claim(id, user.id, dto.workEmail) };
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify claim with token' })
  async verifyClaim(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: VerifyClaimDto) {
    return { data: await this.organizationsService.verifyClaim(id, user.id, dto.token) };
  }

  @Post(':id/members/:memberUserId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add member (admin only)' })
  async addMember(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Param('memberUserId') memberUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return { data: await this.organizationsService.addMember(id, user.id, memberUserId, dto.role, dto.title) };
  }

  @Put(':id/members/:memberUserId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member role (admin only)' })
  async updateMemberRole(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Param('memberUserId') memberUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return { data: await this.organizationsService.updateMemberRole(id, user.id, memberUserId, dto.role, dto.title) };
  }

  @Delete(':id/members/:memberUserId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove member (admin only)' })
  async removeMember(@Param('id') id: string, @CurrentUser() user: any, @Param('memberUserId') memberUserId: string) {
    return { data: await this.organizationsService.removeMember(id, user.id, memberUserId) };
  }
}
