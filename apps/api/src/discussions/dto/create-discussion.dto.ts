import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PollOptionDto {
  @ApiProperty({ example: 'Yes' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  label: string;
}

class CreatePollDto {
  @ApiProperty({ example: 'Is this approach correct?' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  question: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isMultiple?: boolean;

  @ApiProperty({ type: [PollOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PollOptionDto)
  options: PollOptionDto[];
}

export class CreateDiscussionDto {
  @ApiProperty({ example: 'b11f3a4e-...' })
  @IsNotEmpty()
  @IsString()
  communityId: string;

  @ApiProperty({ example: 'How to handle payroll compliance?' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  title: string;

  @ApiProperty({ example: 'Looking for advice on...' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contentType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePollDto)
  poll?: CreatePollDto;
}
