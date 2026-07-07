import { IsOptional, IsString, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuestionDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(300)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(20)
  status?: string;
}
