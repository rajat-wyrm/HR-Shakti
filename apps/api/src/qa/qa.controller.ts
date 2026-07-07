import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QaService } from './qa.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateAnswerDto, UpdateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Q&A')
@Controller('qa')
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Post('questions')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a question' })
  async createQuestion(@CurrentUser() user: any, @Body() dto: CreateQuestionDto) {
    return { data: await this.qaService.createQuestion(user.id, dto) };
  }

  @Get('questions')
  @ApiOperation({ summary: 'List questions' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: string,
  ) {
    return this.qaService.findAll(Number(page) || 1, Number(limit) || 20, tag, status);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question details' })
  async findOne(@Param('id') id: string) {
    return { data: await this.qaService.findOne(id) };
  }

  @Put('questions/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update question' })
  async updateQuestion(
    @Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateQuestionDto,
  ) {
    return { data: await this.qaService.updateQuestion(id, user.id, dto) };
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete question' })
  async removeQuestion(@Param('id') id: string, @CurrentUser() user: any) {
    return { data: await this.qaService.removeQuestion(id, user.id) };
  }

  @Post('questions/:id/answers')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an answer' })
  async createAnswer(
    @Param('id') id: string, @CurrentUser() user: any, @Body() dto: CreateAnswerDto,
  ) {
    return { data: await this.qaService.createAnswer(id, user.id, dto) };
  }

  @Put('questions/:id/answers/:answerId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an answer' })
  async updateAnswer(
    @Param('id') id: string, @Param('answerId') answerId: string,
    @CurrentUser() user: any, @Body() dto: UpdateAnswerDto,
  ) {
    return { data: await this.qaService.updateAnswer(id, answerId, user.id, dto) };
  }

  @Delete('questions/:id/answers/:answerId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an answer' })
  async removeAnswer(
    @Param('id') id: string, @Param('answerId') answerId: string, @CurrentUser() user: any,
  ) {
    return { data: await this.qaService.removeAnswer(id, answerId, user.id) };
  }

  @Post('questions/:id/answers/:answerId/accept')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an answer' })
  async acceptAnswer(
    @Param('id') id: string, @Param('answerId') answerId: string, @CurrentUser() user: any,
  ) {
    return { data: await this.qaService.acceptAnswer(id, answerId, user.id) };
  }

  @Post('questions/:id/vote/:type')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on question (helpful|insightful|from_exp)' })
  async voteQuestion(
    @Param('id') id: string, @Param('type') type: string, @CurrentUser() user: any,
  ) {
    return { data: await this.qaService.voteQuestion(id, user.id, type as any) };
  }

  @Post('questions/:id/answers/:answerId/vote/:type')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on answer (helpful|insightful|from_exp)' })
  async voteAnswer(
    @Param('id') id: string, @Param('answerId') answerId: string,
    @Param('type') type: string, @CurrentUser() user: any,
  ) {
    return { data: await this.qaService.voteAnswer(id, answerId, user.id, type as any) };
  }

  @Get('tags')
  @ApiOperation({ summary: 'List tags' })
  async findTags(@Query('category') category?: string) {
    return { data: await this.qaService.findTags(category) };
  }
}
