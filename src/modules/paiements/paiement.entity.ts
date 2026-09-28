import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Colis } from '../colis/colis.entity';
import { Partenaire } from '../partenaires/partenaire.entity';

export enum PaiementStatut {
  EN_ATTENTE = 'en_attente',
  PAYE = 'paye',
  ANNULE = 'annule',
}

@Entity('paiements')
export class Paiement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'colis_id', nullable: true })
  colisId: string;

  @ManyToOne(() => Colis, { nullable: true })
  @JoinColumn({ name: 'colis_id' })
  colis: Colis;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ nullable: true })
  type: string; // ex: livraison, reception, commission...

  @Column({ type: 'numeric' })
  montant: number;

  @Column({ default: PaiementStatut.EN_ATTENTE })
  statut: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
