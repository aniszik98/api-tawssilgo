import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Livreur } from '../livreurs/livreur.entity';
import { Partenaire } from '../partenaires/partenaire.entity';
import { Client } from '../clients/client.entity';

@Entity('livreur_paiements')
export class LivreurVersement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'livreur_id' })
  livreurId: string;

  @ManyToOne(() => Livreur)
  @JoinColumn({ name: 'livreur_id' })
  livreur: Livreur;

  @Column({ type: 'numeric', default: 0 })
  montant: number;

  @Column({ name: 'paye_par_role', nullable: true })
  payeParRole: string;

  @Column({ name: 'paye_par_nom', nullable: true })
  payeParNom: string;

  @Column({ name: 'paye_par_id', nullable: true })
  payeParId: string;

  @Column({ default: '' })
  commentaire: string;

  @CreateDateColumn({ name: 'versement_le' })
  versementLe: Date;
}

@Entity('partenaire_paiements')
export class PartenaireVersement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partenaire_id' })
  partenaireId: string;

  @ManyToOne(() => Partenaire)
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ type: 'numeric', default: 0 })
  montant: number;

  @Column({ default: '' })
  commentaire: string;

  @Column({ name: 'paye_par_role', default: 'administrateur' })
  payeParRole: string;

  @Column({ name: 'paye_par_nom', nullable: true })
  payeParNom: string;

  @Column({ name: 'paye_par_id', nullable: true })
  payeParId: string;

  @CreateDateColumn({ name: 'versement_le' })
  versementLe: Date;
}

@Entity('client_paiements')
export class ClientVersement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'numeric', default: 0 })
  montant: number;

  @Column({ name: 'paye_par_role', nullable: true })
  payeParRole: string;

  @Column({ name: 'paye_par_nom', nullable: true })
  payeParNom: string;

  @Column({ name: 'paye_par_id', nullable: true })
  payeParId: string;

  @Column({ type: 'jsonb', default: [] })
  details: any[];

  @CreateDateColumn({ name: 'versement_le' })
  versementLe: Date;
}
