import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great question! Here is my take...' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated content...' })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class VotePollDto {
  @ApiProperty({ example: 'poll-option-uuid' })
  @IsNotEmpty()
  @IsString()
  optionId: string;
}
