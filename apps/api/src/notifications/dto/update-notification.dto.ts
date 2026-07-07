import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(
  OmitType(CreateNotificationDto, ['type', 'title', 'body', 'data', 'link', 'channel'] as const),
) {}
