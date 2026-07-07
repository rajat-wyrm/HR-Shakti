import { IsNotEmpty, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';

export class ReactionActionDto {
  @ApiProperty({ description: 'Target content type (e.g. discussion, comment)', example: 'discussion' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  targetType: string;

  @ApiProperty({ description: 'Target content ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsString()
  targetId: string;

  @ApiProperty({ enum: ReactionType, description: 'Reaction type' })
  @IsNotEmpty()
  @IsEnum(ReactionType)
  type: ReactionType;
}
