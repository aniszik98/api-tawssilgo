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
import { Livreur } from '../livreurs/livreur.entity';
import { Client } from '../clients/client.entity';

export enum ColisStatut {
  EN_ATTENTE = 'en_attente',
  ATTRIBUE = 'attribue',
  EN_INTERNE = 'en_interne',
  DISPONIBLE = 'disponible',
  LIVREE = 'livree',
  RETOUR = 'retour',
  CLOTUREE = 'cloturee',
}

@Entity('colis')
export class Colis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code_suivi', unique: true, nullable: true })
  codeSuivi: string;

  @Column({ name: 'external_id', nullable: true, unique: true })
  externalId: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  destination: string;

  @Column({ default: '' })
  commune: string;

  @Column({ name: 'partenaire_recepteur_id', nullable: true })
  partenaireRecepteurId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_recepteur_id' })
  partenaireRecepteur: Partenaire;

  @Column({ name: 'partenaire_livreur_id', nullable: true })
  partenaireLivreurId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_livreur_id' })
  partenaireLivreur: Partenaire;

  @Column({ name: 'livreur_id', nullable: true })
  livreurId: string;

  @ManyToOne(() => Livreur, { nullable: true })
  @JoinColumn({ name: 'livreur_id' })
  livreur: Livreur;

  @Column({ name: 'livreur_nom', default: '' })
  livreurNom: string;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'client_nom', default: '' })
  clientNom: string;

  @Column({ name: 'client_tel', default: '' })
  clientTel: string;

  @Column({ name: 'destinataire_nom', default: '' })
  destinataireNom: string;

  @Column({ name: 'destinataire_tel', default: '' })
  destinataireTel: string;

  @Column({ name: 'destinataire_adresse', default: '' })
  destinataireAdresse: string;

  @Column({ name: 'adresse_complement', default: '' })
  adresseComplement: string;

  @Column({ name: 'ramassage_adresse', default: '' })
  ramassageAdresse: string;

  @Column({ name: 'ramassage_tel', default: '' })
  ramassageTel: string;

  @Column({ name: 'type_livraison', default: '' })
  typeLivraison: string;

  @Column({ default: '' })
  boutique: string;

  @Column({ type: 'numeric', nullable: true })
  poids: number;

  @Column({ type: 'numeric', name: 'prix_livraison', nullable: true })
  prixLivraison: number;

  @Column({ type: 'numeric', name: 'prix_commande', nullable: true })
  prixCommande: number;

  @Column({ type: 'numeric', name: 'prix_commande_initial', nullable: true })
  prixCommandeInitial: number;

  @Column({ name: 'livraison_gratuite', default: false })
  livraisonGratuite: boolean;

  @Column({ name: 'livraison_grille', type: 'int', nullable: true })
  livraisonGrille: number;

  @Column({ name: 'etape_livraison', nullable: true })
  etapeLivraison: string;

  @Column({ name: 'etape_paiement', nullable: true })
  etapePaiement: string;

  @Column({ name: 'etape_retour', nullable: true })
  etapeRetour: string;

  @Column({ name: 'phase_echange', nullable: true })
  phaseEchange: string;

  @Column({ name: 'client_paye_at', type: 'timestamptz', nullable: true })
  clientPayeAt: Date;

  @Column({ name: 'ticket_imprime_at', type: 'timestamptz', nullable: true })
  ticketImprimeAt: Date;

  @Column({ default: ColisStatut.EN_ATTENTE })
  statut: string;

  @Column({ name: 'statut_attribue_at', type: 'timestamptz', nullable: true })
  statutAttribueAt: Date;

  @Column({ name: 'statut_en_interne_at', type: 'timestamptz', nullable: true })
  statutEnInterneAt: Date;

  @Column({ name: 'statut_disponible_at', type: 'timestamptz', nullable: true })
  statutDisponibleAt: Date;

  @Column({ name: 'statut_livree_at', type: 'timestamptz', nullable: true })
  statutLivreeAt: Date;

  @Column({ name: 'statut_cloturee_at', type: 'timestamptz', nullable: true })
  statutClottureeAt: Date;

  @Column({ name: 'retour_motif', nullable: true })
  retourMotif: string;

  @Column({ name: 'retour_type', nullable: true })
  retourType: string;

  @Column({ name: 'retour_detail', nullable: true })
  retourDetail: string;

  @Column({ name: 'retour_tentatives', default: 0 })
  retourTentatives: number;

  @Column({ name: 'retour_at', type: 'timestamptz', nullable: true })
  retourAt: Date;

  @Column({ name: 'point_caisse_id', nullable: true })
  pointCaisseId: string;

  @Column({ name: 'navette_id', nullable: true })
  navetteId: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
