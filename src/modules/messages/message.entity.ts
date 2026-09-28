import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partenaire } from '../partenaires/partenaire.entity';

// Correspond à la table "messages" (fil de discussion admin <-> partenaire)
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ name: 'from_admin', default: true })
  fromAdmin: boolean;

  @Column()
  contenu: string;

  @Column({ default: false })
  lu: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
