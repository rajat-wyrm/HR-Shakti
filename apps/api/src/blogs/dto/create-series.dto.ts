import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSeriesDto {
  @ApiProperty({ example: 'HR Compliance Guide' })
  @IsNotEmpty() @IsString() @MaxLength(300)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(500)
  coverImageUrl?: string;
}
