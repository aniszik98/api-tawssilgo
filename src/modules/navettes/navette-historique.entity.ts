import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Navette } from './navette.entity';
import { Livreur } from '../livreurs/livreur.entity';

// Trace chaque envoi/mouvement d'une navette, avec la liste des colis embarqués
@Entity('navettes_historique')
export class NavetteHistorique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'navette_id', nullable: true })
  navetteId: string;

  @ManyToOne(() => Navette, { nullable: true })
  @JoinColumn({ name: 'navette_id' })
  navette: Navette;

  @Column({ nullable: true })
  nom: string;

  @Column({ default: 'envoi' })
  action: string;

  @Column({ nullable: true })
  depart: string;

  @Column({ nullable: true })
  arrivee: string;

  @Column({ type: 'jsonb', default: [] })
  wilayas: string[];

  @Column({ name: 'colis_ids', type: 'jsonb', default: [] })
  colisIds: string[];

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ name: 'arrivee_at', type: 'date', nullable: true })
  arriveeAt: Date;

  @Column({ name: 'conducteur_id', nullable: true })
  conducteurId: string;

  @ManyToOne(() => Livreur, { nullable: true })
  @JoinColumn({ name: 'conducteur_id' })
  conducteur: Livreur;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
