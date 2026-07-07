import { IsNotEmpty, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommunityAccessType } from '@prisma/client';

export class CreateCommunityDto {
  @ApiProperty({ example: 'HR Professionals Network' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'hr-professionals-network' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  slug: string;

  @ApiProperty({ example: 'A community for HR professionals to share best practices', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;

  @ApiProperty({ enum: CommunityAccessType, default: 'public' })
  @IsOptional()
  @IsEnum(CommunityAccessType)
  accessType?: CommunityAccessType;
}
