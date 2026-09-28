import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';

// Même principe que ApiIntegration mais côté client (ex: sa boutique en ligne
// expose une API listant ses commandes, qu'on importe ici en tant que colis).
@Entity('client_apis')
export class ClientApi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ default: 'TawssilGo' })
  nom: string;

  @Column({ name: 'url_api', default: '' })
  urlApi: string;

  @Column({ name: 'api_key', default: '' })
  apiKey: string;

  @Column({ type: 'jsonb' })
  mapping: { result_path: string; map: Record<string, string> };

  @Column({ default: true })
  actif: boolean;

  @Column({ name: 'sync_ok', nullable: true })
  syncOk: boolean;

  @Column({ name: 'dernier_sync_at', type: 'timestamptz', nullable: true })
  dernierSyncAt: Date;

  @Column({ name: 'dernier_sync_message', default: '' })
  dernierSyncMessage: string;

  @Column({ name: 'sync_insertions', default: 0 })
  syncInsertions: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
