import {
  Controller, Get, Put, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddExperienceDto } from './dto/add-experience.dto';
import { AddEducationDto } from './dto/add-education.dto';
import { AddCertificationDto } from './dto/add-certification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return { data: await this.usersService.getProfile(user.id) };
  }

  @Put('me')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return { data: await this.usersService.updateProfile(user.id, dto) };
  }

  @Get('by-email/:email')
  async getByEmail(@Param('email') email: string) {
    return { data: await this.usersService.findByEmail(email) };
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return { data: await this.usersService.getProfile(id) };
  }

  @Post('me/experiences')
  async addExperience(@CurrentUser() user: any, @Body() dto: AddExperienceDto) {
    return { data: await this.usersService.addExperience(user.id, dto) };
  }

  @Put('me/experiences/:id')
  async updateExperience(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: AddExperienceDto) {
    return { data: await this.usersService.updateExperience(id, user.id, dto) };
  }

  @Delete('me/experiences/:id')
  async deleteExperience(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.deleteExperience(id, user.id) };
  }

  @Post('me/education')
  async addEducation(@CurrentUser() user: any, @Body() dto: AddEducationDto) {
    return { data: await this.usersService.addEducation(user.id, dto) };
  }

  @Delete('me/education/:id')
  async deleteEducation(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.deleteEducation(id, user.id) };
  }

  @Post('me/certifications')
  async addCertification(@CurrentUser() user: any, @Body() dto: AddCertificationDto) {
    return { data: await this.usersService.addCertification(user.id, dto) };
  }

  @Delete('me/certifications/:id')
  async deleteCertification(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.deleteCertification(id, user.id) };
  }

  @Post('me/skills')
  async addSkill(@CurrentUser() user: any, @Body('skill') skill: string) {
    return { data: await this.usersService.addSkill(user.id, skill) };
  }

  @Delete('me/skills/:id')
  async removeSkill(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.removeSkill(id, user.id) };
  }
}
