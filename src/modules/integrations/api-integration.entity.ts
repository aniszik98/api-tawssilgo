import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Partenaire } from '../partenaires/partenaire.entity';

/**
 * Configuration d'une source externe (API tierce d'un partenaire) à partir
 * de laquelle on importe automatiquement des commandes sous forme de colis.
 * C'est ici que se fait le "pont" entre ce système et une source de données
 * externe (potentiellement une autre base de données, exposée via une API).
 */
@Entity('api_integrations')
export class ApiIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'admin_id', nullable: true })
  adminId: string;

  @Column({ default: '' })
  nom: string;

  @Column({ name: 'url_api', default: '' })
  urlApi: string;

  @Column({ default: 'GET' })
  methode: string;

  @Column({ name: 'api_key', default: '' })
  apiKey: string;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  // { "result_path": "commandes", "map": { "champColisLocal": "chemin.dans.reponse.externe" } }
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

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
