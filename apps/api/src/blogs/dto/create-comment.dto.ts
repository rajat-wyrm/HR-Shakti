import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great article! Thanks for sharing.' })
  @IsNotEmpty() @IsString()
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment...' })
  @IsNotEmpty() @IsString()
  content: string;
}
