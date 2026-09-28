import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('partenaires')
export class Partenaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true })
  magasin: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: '' })
  commune: string;

  @Column({ name: 'point_code', default: '' })
  pointCode: string;

  @Column({ type: 'numeric', name: 'tarif_reception', default: 0 })
  tarifReception: number;

  @Column({ type: 'numeric', name: 'tarif_livraison', default: 0 })
  tarifLivraison: number;

  @Column({ type: 'numeric', default: 0 })
  solde: number;

  @Column({ default: true })
  actif: boolean;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
