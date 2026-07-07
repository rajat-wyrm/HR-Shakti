import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportActionDto {
  @ApiProperty({ description: 'Target content type (e.g. discussion, comment)', example: 'discussion' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  targetType: string;

  @ApiProperty({ description: 'Target content ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsString()
  targetId: string;

  @ApiProperty({ description: 'Reason for reporting', example: 'Inappropriate content' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiProperty({ description: 'Optional detailed description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
