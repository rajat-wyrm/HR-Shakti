import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSeriesDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(300)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(500)
  coverImageUrl?: string;
}
