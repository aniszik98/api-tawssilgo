import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MessagerieService } from './messagerie.service';
import { CreateChatReseauDto } from './dto/create-chat-reseau.dto';
import { CreateMessagePartenaireDto } from './dto/create-message-partenaire.dto';
import { CreateMessageEquipeDto } from './dto/create-message-equipe.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Messagerie')
@ApiSecurity('api-key')
@Controller()
export class MessagerieController {
  constructor(private readonly service: MessagerieService) {}

  @Post('chat-reseau')
  envoyerChatReseau(@Body() dto: CreateChatReseauDto) {
    return this.service.envoyerChatReseau(dto);
  }

  @Get('chat-reseau')
  listChatReseau(@Query() query: PaginationQueryDto) {
    return this.service.listChatReseau(query);
  }

  @Post('messages-partenaires')
  envoyerMessagePartenaire(@Body() dto: CreateMessagePartenaireDto) {
    return this.service.envoyerMessagePartenaire(dto);
  }

  @Get('messages-partenaires/:partenaireAId/:partenaireBId')
  conversationEntrePartenaires(
    @Param('partenaireAId') a: string,
    @Param('partenaireBId') b: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.conversationEntrePartenaires(a, b, query);
  }

  @Post('messages-equipe')
  envoyerMessageEquipe(@Body() dto: CreateMessageEquipeDto) {
    return this.service.envoyerMessageEquipe(dto);
  }

  @Get('messages-equipe/:partenaireId')
  listMessagesEquipe(@Param('partenaireId') partenaireId: string, @Query() query: PaginationQueryDto) {
    return this.service.listMessagesEquipe(partenaireId, query);
  }
}
