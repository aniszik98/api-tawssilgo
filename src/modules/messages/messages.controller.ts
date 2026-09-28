import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Messages')
@ApiSecurity('api-key')
@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.service.create(dto);
  }

  @Get('partenaire/:partenaireId')
  findConversation(
    @Param('partenaireId') partenaireId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findConversation(partenaireId, query);
  }
}
