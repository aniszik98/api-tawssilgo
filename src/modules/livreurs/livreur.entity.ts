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

@Entity('livreurs')
export class Livreur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ name: 'partenaire_id', nullable: true })
  partenaireId: string;

  @ManyToOne(() => Partenaire, { nullable: true })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @Column({ name: 'type_vehicule', default: '' })
  typeVehicule: string;

  @Column({ type: 'numeric', default: 0 })
  solde: number;

  @Column({ name: 'permis_photo_url', default: '' })
  permisPhotoUrl: string;

  @Column({ name: 'carte_grise_photo_url', default: '' })
  carteGrisePhotoUrl: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ default: 'actif' })
  statut: string; // actif | en_attente_validation | refuse | suspendu

  @Column({ name: 'refuse_raison', default: '' })
  refuseRaison: string;

  @Column({ name: 'valide_par', default: '' })
  validePar: string;

  @Column({ name: 'valide_role', default: '' })
  valideRole: string;

  @Column({ name: 'valide_le', type: 'timestamptz', nullable: true })
  valideLe: Date;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
