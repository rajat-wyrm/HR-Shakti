import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimOrganizationDto {
  @ApiProperty({ example: 'alice@acmecorp.com' })
  @IsNotEmpty()
  @IsEmail()
  workEmail: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;
}
