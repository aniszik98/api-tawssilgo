import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Colis } from './colis.entity';
import { Partenaire } from '../partenaires/partenaire.entity';
import { Livreur } from '../livreurs/livreur.entity';
import { Collaborateur } from '../collaborateurs/collaborateur.entity';

// Table d'audit : une ligne créée automatiquement à chaque changement de statut d'un colis.
@Entity('colis_historique')
export class ColisHistorique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'colis_id' })
  colisId: string;

  @ManyToOne(() => Colis)
  @JoinColumn({ name: 'colis_id' })
  colis: Colis;

  @Column({ default: 'admin' })
  role: string;

  @Column({ default: '' })
  nom: string;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ name: 'collaborateur_id', nullable: true })
  collaborateurId: string;

  @ManyToOne(() => Collaborateur, { nullable: true })
  @JoinColumn({ name: 'collaborateur_id' })
  collaborateur: Collaborateur;

  @Column({ name: 'livreur_id', nullable: true })
  livreurId: string;

  @ManyToOne(() => Livreur, { nullable: true })
  @JoinColumn({ name: 'livreur_id' })
  livreur: Livreur;

  @Column({ name: 'ancien_statut', nullable: true })
  ancienStatut: string;

  @Column({ name: 'nouveau_statut' })
  nouveauStatut: string;

  @Column({ default: '' })
  commentaire: string;

  @Column({ default: '' })
  evenement: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
