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

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id', nullable: true, unique: true })
  externalId: string;

  @Column()
  nom: string;

  @Column({ default: '' })
  telephone: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  adresse: string;

  @Column({ default: '' })
  boutique: string;

  @Column({ type: 'numeric', default: 0 })
  solde: number;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ name: 'point_caisse_id', nullable: true })
  pointCaisseId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
