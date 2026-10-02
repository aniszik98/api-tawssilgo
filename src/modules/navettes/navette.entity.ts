import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Livreur } from '../livreurs/livreur.entity';

@Entity('navettes')
export class Navette {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column()
  depart: string;

  @Column()
  arrivee: string;

  @Column({ type: 'jsonb', default: [] })
  wilayas: string[];

  @Column({ default: 'actif' })
  statut: string; // actif | en_route | arrivee | annule

  @Column({ nullable: true })
  capacite: number;

  @Column({ name: 'depart_at', type: 'date', nullable: true })
  departAt: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ name: 'conducteur_id', nullable: true })
  conducteurId: string;

  @ManyToOne(() => Livreur, { nullable: true })
  @JoinColumn({ name: 'conducteur_id' })
  conducteur: Livreur;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
