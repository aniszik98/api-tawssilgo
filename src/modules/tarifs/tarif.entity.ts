import { Column, Entity, PrimaryColumn } from 'typeorm';

// Grille tarifaire nationale par wilaya (pas d'UUID : clé métier "num")
@Entity('tarifs_partage_colis')
export class Tarif {
  @PrimaryColumn()
  num: number;

  @Column({ name: 'wilaya_nom' })
  wilayaNom: string;

  @Column()
  norm: string;

  @Column({ name: 'enc_d', nullable: true })
  encD: number; // encaissé, domicile

  @Column({ name: 'enc_s', nullable: true })
  encS: number; // encaissé, stopdesk

  @Column({ name: 'conv_d', nullable: true })
  convD: number; // convenu (échange), domicile

  @Column({ name: 'conv_s', nullable: true })
  convS: number; // convenu (échange), stopdesk
}
