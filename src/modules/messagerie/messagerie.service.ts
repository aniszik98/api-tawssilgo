import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatReseau, MessageEquipe, MessagePartenaire } from './messagerie.entities';
import { CreateChatReseauDto } from './dto/create-chat-reseau.dto';
import { CreateMessagePartenaireDto } from './dto/create-message-partenaire.dto';
import { CreateMessageEquipeDto } from './dto/create-message-equipe.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class MessagerieService {
  constructor(
    @InjectRepository(ChatReseau)
    private readonly chatRepo: Repository<ChatReseau>,
    @InjectRepository(MessagePartenaire)
    private readonly messagePartenaireRepo: Repository<MessagePartenaire>,
    @InjectRepository(MessageEquipe)
    private readonly messageEquipeRepo: Repository<MessageEquipe>,
  ) {}

  // --- Chat réseau (diffusion générale) ---
  envoyerChatReseau(dto: CreateChatReseauDto) {
    return this.chatRepo.save(this.chatRepo.create(dto));
  }

  async listChatReseau(query: PaginationQueryDto) {
    const { page, limit } = query;
    const [data, total] = await this.chatRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  // --- Messages directs entre partenaires ---
  envoyerMessagePartenaire(dto: CreateMessagePartenaireDto) {
    return this.messagePartenaireRepo.save(this.messagePartenaireRepo.create(dto));
  }

  conversationEntrePartenaires(partenaireAId: string, partenaireBId: string, query: PaginationQueryDto) {
    const { page, limit } = query;
    return this.messagePartenaireRepo
      .createQueryBuilder('m')
      .where(
        '(m.expediteur_id = :a AND m.destinataire_id = :b) OR (m.expediteur_id = :b AND m.destinataire_id = :a)',
        { a: partenaireAId, b: partenaireBId },
      )
      .orderBy('m.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
      .then(([data, total]) => ({ data, total, page, limit }));
  }

  // --- Messagerie d'équipe (interne à un partenaire) ---
  envoyerMessageEquipe(dto: CreateMessageEquipeDto) {
    return this.messageEquipeRepo.save(this.messageEquipeRepo.create(dto));
  }

  async listMessagesEquipe(partenaireId: string, query: PaginationQueryDto) {
    const { page, limit } = query;
    const [data, total] = await this.messageEquipeRepo.findAndCount({
      where: { partenaireId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
