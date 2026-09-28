import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Colis } from '../colis/colis.entity';
import { Livreur } from '../livreurs/livreur.entity';

@Entity('appels')
export class Appel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'colis_id' })
  colisId: string;

  @ManyToOne(() => Colis)
  @JoinColumn({ name: 'colis_id' })
  colis: Colis;

  @Column({ name: 'livreur_id', nullable: true })
  livreurId: string;

  @ManyToOne(() => Livreur, { nullable: true })
  @JoinColumn({ name: 'livreur_id' })
  livreur: Livreur;

  @Column({ name: 'livreur_nom', default: '' })
  livreurNom: string;

  @Column({ default: '' })
  tel: string;

  @Column({ default: 'sortant' })
  sens: string; // sortant | entrant | note

  @Column({ name: 'duree_seconde', default: 0 })
  dureeSeconde: number;

  @Column({ default: '' })
  note: string;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;
}
