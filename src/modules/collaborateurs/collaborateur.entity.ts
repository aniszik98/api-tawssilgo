import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partenaire } from '../partenaires/partenaire.entity';

@Entity('collaborateurs')
export class Collaborateur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partenaire_id' })
  partenaireId: string;

  @ManyToOne(() => Partenaire)
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ default: '' })
  prenom: string;

  @Column({ default: '' })
  nom: string;

  @Column({ default: '' })
  telephone: string;

  @Column({ default: '' })
  email: string;

  @Column({ type: 'jsonb', default: {} })
  taches: Record<string, any>;

  @Column({ default: true })
  actif: boolean;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
