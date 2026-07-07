import { IsOptional, IsEnum } from 'class-validator';
import { ConnectionStatus } from '@prisma/client';

export class ConnectionStatusQueryDto {
  @IsOptional()
  @IsEnum(ConnectionStatus)
  status?: ConnectionStatus;
}
