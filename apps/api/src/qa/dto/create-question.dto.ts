import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'How to handle payroll tax compliance in India?' })
  @IsNotEmpty() @IsString() @MaxLength(300)
  title: string;

  @ApiProperty({ example: 'Looking for guidance on TDS deductions...' })
  @IsNotEmpty() @IsString()
  content: string;

  @ApiProperty({ required: false, example: ['payroll', 'tax'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional() @IsInt() @Min(0)
  bounty?: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  bountyExpiresAt?: string;
}
