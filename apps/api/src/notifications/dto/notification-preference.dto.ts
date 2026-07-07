import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePreferenceDto {
  @ApiProperty({ example: 'new_comment', required: true })
  @IsNotEmpty() @IsString() @MaxLength(50)
  type: string;

  @ApiProperty({ required: false, enum: ['in_app', 'email', 'both'], default: 'in_app' })
  @IsOptional() @IsString()
  channel?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional() @IsBoolean()
  enabled?: boolean;
}

export class UpdatePreferenceDto {
  @ApiProperty({ required: false, enum: ['in_app', 'email', 'both'] })
  @IsOptional() @IsString()
  channel?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsBoolean()
  enabled?: boolean;
}
