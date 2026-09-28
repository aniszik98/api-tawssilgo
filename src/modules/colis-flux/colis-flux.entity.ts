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
import { Collaborateur } from '../collaborateurs/collaborateur.entity';
import { Livreur } from '../livreurs/livreur.entity';

// Trace chaque mouvement physique d'un colis (entrée/sortie d'un point/dépôt)
@Entity('colis_flux')
export class ColisFlux {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'colis_id', nullable: true })
  colisId: string;

  @ManyToOne(() => Colis, { nullable: true })
  @JoinColumn({ name: 'colis_id' })
  colis: Colis;

  @Column({ name: 'code_suivi', default: '' })
  codeSuivi: string;

  @Column({ name: 'partenaire_id' })
  partenaireId: string;

  @ManyToOne(() => Partenaire)
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ name: 'collaborateur_id', nullable: true })
  collaborateurId: string;

  @ManyToOne(() => Collaborateur, { nullable: true })
  @JoinColumn({ name: 'collaborateur_id' })
  collaborateur: Collaborateur;

  @Column({ name: 'nom_operateur', default: '' })
  nomOperateur: string;

  @Column()
  sens: string; // entrant | sortant

  @Column({ default: '' })
  note: string;

  @Column({ name: 'livreur_id', nullable: true })
  livreurId: string;

  @ManyToOne(() => Livreur, { nullable: true })
  @JoinColumn({ name: 'livreur_id' })
  livreur: Livreur;

  @Column({ name: 'livreur_partenaire_id', nullable: true })
  livreurPartenaireId: string;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;
}
