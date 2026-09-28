import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partenaire } from '../partenaires/partenaire.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'for_admin', default: false })
  forAdmin: boolean;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ default: 'info' })
  type: string;

  @Column()
  titre: string;

  @Column()
  contenu: string;

  @Column({ default: '' })
  lien: string;

  @Column({ default: false })
  lu: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
