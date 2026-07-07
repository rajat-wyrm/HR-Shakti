import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({ example: 'Here is a detailed explanation...' })
  @IsNotEmpty() @IsString()
  content: string;
}

export class UpdateAnswerDto {
  @ApiProperty({ example: 'Updated answer content...' })
  @IsNotEmpty() @IsString()
  content: string;
}
