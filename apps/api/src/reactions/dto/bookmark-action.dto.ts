import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookmarkActionDto {
  @ApiProperty({ description: 'Target content type (e.g. discussion, comment)', example: 'discussion' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  targetType: string;

  @ApiProperty({ description: 'Target content ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsString()
  targetId: string;
}
