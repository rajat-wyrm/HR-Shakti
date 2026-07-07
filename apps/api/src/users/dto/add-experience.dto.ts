import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class AddExperienceDto {
  @IsString() @MaxLength(200) title: string;
  @IsString() @MaxLength(200) company: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
  @IsString() startDate: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}
