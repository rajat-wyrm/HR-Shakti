import { IsNotEmpty, IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'How to Build a Remote HR Team' })
  @IsNotEmpty() @IsString() @MaxLength(300)
  title: string;

  @ApiProperty({ example: 'Full content here...' })
  @IsNotEmpty() @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(500)
  coverImageUrl?: string;

  @ApiProperty({ required: false, example: ['hr-tech', 'remote'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, default: 'draft' })
  @IsOptional() @IsString()
  status?: string;
}
