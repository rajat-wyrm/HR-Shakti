import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class AddCertificationDto {
  @IsString() @MaxLength(200) name: string;
  @IsString() @MaxLength(200) issuingOrg: string;
  @IsOptional() @IsString() @MaxLength(200) credentialId?: string;
  @IsOptional() @IsString() @MaxLength(500) credentialUrl?: string;
  @IsString() earnedDate: string;
  @IsOptional() @IsString() expirationDate?: string;
  @IsOptional() @IsBoolean() isVerified?: boolean;
}
