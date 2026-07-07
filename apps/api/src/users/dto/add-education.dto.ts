import { IsString, IsOptional, MaxLength } from 'class-validator';

export class AddEducationDto {
  @IsString() @MaxLength(200) institution: string;
  @IsOptional() @IsString() @MaxLength(200) degree?: string;
  @IsOptional() @IsString() @MaxLength(200) fieldOfStudy?: string;
  @IsString() startDate: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() @MaxLength(50) grade?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}
