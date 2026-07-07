import { IsNotEmpty, IsString, IsOptional, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'hr-tech', required: true })
  @IsNotEmpty() @IsString() @MaxLength(50)
  type: string;

  @ApiProperty({ example: 'New comment on your post' })
  @IsNotEmpty() @IsString() @MaxLength(200)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  body?: string;

  @ApiProperty({ required: false, example: { postId: 'uuid', commentId: 'uuid' } })
  @IsOptional() @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ required: false, example: '/posts/my-post' })
  @IsOptional() @IsString() @MaxLength(500)
  link?: string;

  @ApiProperty({ required: false, enum: ['in_app', 'email', 'both'], default: 'in_app' })
  @IsOptional() @IsString()
  channel?: string;
}
