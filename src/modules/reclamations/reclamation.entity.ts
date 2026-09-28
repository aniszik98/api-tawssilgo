import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Colis } from '../colis/colis.entity';
import { Client } from '../clients/client.entity';
import { Partenaire } from '../partenaires/partenaire.entity';
import { Livreur } from '../livreurs/livreur.entity';

export enum ReclamationStatut {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TRAITEE = 'traitee',
  REJETEE = 'rejetee',
}

@Entity('reclamations')
export class Reclamation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  numero: string;

  @Column({ name: 'colis_id', nullable: true })
  colisId: string;

  @ManyToOne(() => Colis, { nullable: true })
  @JoinColumn({ name: 'colis_id' })
  colis: Colis;

  @Column({ name: 'code_suivi', default: '' })
  codeSuivi: string;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'client_nom', default: '' })
  clientNom: string;

  @Column({ name: 'client_tel', default: '' })
  clientTel: string;

  @Column({ name: 'client_email', default: '' })
  clientEmail: string;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ name: 'livreur_id', nullable: true })
  livreurId: string;

  @ManyToOne(() => Livreur, { nullable: true })
  @JoinColumn({ name: 'livreur_id' })
  livreur: Livreur;

  @Column({ default: 'autre' })
  motif: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: ReclamationStatut.EN_ATTENTE })
  statut: string;

  @Column({ default: false })
  remontee: boolean;

  @Column({ default: '' })
  reponse: string;

  @Column({ name: 'actions_effectuees', default: '' })
  actionsEffectuees: string;

  @Column({ name: 'traite_par', default: '' })
  traitePar: string;

  @Column({ name: 'traite_le', type: 'timestamptz', nullable: true })
  traiteLe: Date;

  @Column({ name: 'photo_url', default: '' })
  photoUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
