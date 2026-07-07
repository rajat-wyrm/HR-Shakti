import { IsOptional, IsString, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(300)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(500)
  coverImageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  status?: string;
}
