import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Notifications')
@ApiSecurity('api-key')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto & { partenaireId?: string; forAdmin?: boolean }) {
    return this.service.findAll(query);
  }

  @Post(':id/lue')
  marquerLue(@Param('id') id: string) {
    return this.service.marquerLue(id);
  }
}
