import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partenaire } from '../partenaires/partenaire.entity';
import { Collaborateur } from '../collaborateurs/collaborateur.entity';

// Fil de discussion "réseau" : diffusion entre partenaires/collaborateurs
@Entity('chat_reseau')
export class ChatReseau {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'expediteur_role', default: 'partenaire' })
  expediteurRole: string;

  @Column({ name: 'expediteur_nom', default: '' })
  expediteurNom: string;

  @Column()
  contenu: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// Messages privés directs entre deux partenaires
@Entity('messages_partenaires')
export class MessagePartenaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expediteur_id' })
  expediteurId: string;

  @ManyToOne(() => Partenaire)
  @JoinColumn({ name: 'expediteur_id' })
  expediteur: Partenaire;

  @Column({ name: 'destinataire_id' })
  destinataireId: string;

  @ManyToOne(() => Partenaire)
  @JoinColumn({ name: 'destinataire_id' })
  destinataire: Partenaire;

  @Column()
  contenu: string;

  @Column({ default: false })
  lu: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// Messagerie interne à l'équipe d'un partenaire (collaborateurs)
@Entity('messages_equipe')
export class MessageEquipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partenaire_id' })
  partenaireId: string;

  @ManyToOne(() => Partenaire)
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ name: 'collaborateur_id' })
  collaborateurId: string;

  @ManyToOne(() => Collaborateur)
  @JoinColumn({ name: 'collaborateur_id' })
  collaborateur: Collaborateur;

  @Column({ default: 'collaborateur' })
  role: string;

  @Column()
  contenu: string;

  @Column({ default: false })
  lu: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
