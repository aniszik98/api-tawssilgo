import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reclamation } from './reclamation.entity';

@Entity('reclamation_historique')
export class ReclamationHistorique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reclamation_id' })
  reclamationId: string;

  @ManyToOne(() => Reclamation)
  @JoinColumn({ name: 'reclamation_id' })
  reclamation: Reclamation;

  @Column({ default: 'admin' })
  role: string;

  @Column({ default: '' })
  nom: string;

  @Column({ name: 'ancien_statut', default: '' })
  ancienStatut: string;

  @Column({ name: 'nouveau_statut' })
  nouveauStatut: string;

  @Column({ default: '' })
  commentaire: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
