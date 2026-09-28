import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Ordre important : on respecte les clés étrangères (partenaires/livreurs/
// clients doivent exister avant les colis qui les référencent).
const SYNCED_TABLES = ['partenaires', 'livreurs', 'clients', 'colis'];

export interface SyncTableReport {
  versSecondaire: number;
  versPrimaire: number;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectDataSource() private readonly primaryDb: DataSource,
    @InjectDataSource('secondary') private readonly secondaryDb: DataSource,
  ) {}

  /**
   * Lance une passe de synchro bidirectionnelle sur toutes les tables
   * partagées. Idempotent : ne recopie jamais un enregistrement déjà
   * présent des deux côtés (comparaison par id, pas de colonne de date
   * requise — contrairement à l'approche "curseur" décrite dans le README
   * initial, celle-ci n'a besoin d'aucune hypothèse sur le nom des colonnes).
   */
  async runAll(): Promise<Record<string, SyncTableReport>> {
    const report: Record<string, SyncTableReport> = {};

    for (const table of SYNCED_TABLES) {
      const versSecondaire = await this.copyMissing(this.primaryDb, this.secondaryDb, table);
      const versPrimaire = await this.copyMissing(this.secondaryDb, this.primaryDb, table);
      report[table] = { versSecondaire, versPrimaire };
      this.logger.log(
        `${table} : ${versSecondaire} copié(s) vers la base partenaire, ${versPrimaire} copié(s) vers ta base`,
      );
    }

    return report;
  }

  /**
   * Copie dans `to` toutes les lignes de `table` présentes dans `from` mais
   * absentes de `to`. Fonctionne pour n'importe quelle table sans connaître
   * ses colonnes à l'avance : elle lit les lignes manquantes avec SELECT *
   * puis reconstruit un INSERT dynamiquement à partir des clés retournées.
   */
  private async copyMissing(from: DataSource, to: DataSource, table: string): Promise<number> {
    const fromIds: { id: string }[] = await from.query(`SELECT id FROM ${table}`);
    const toIds: { id: string }[] = await to.query(`SELECT id FROM ${table}`);

    const toIdSet = new Set(toIds.map((r) => String(r.id)));
    const missingIds = fromIds.map((r) => r.id).filter((id) => !toIdSet.has(String(id)));

    if (missingIds.length === 0) return 0;

    const rows: Record<string, any>[] = await from.query(
      `SELECT * FROM ${table} WHERE id = ANY($1)`,
      [missingIds],
    );

    for (const row of rows) {
      const columns = Object.keys(row);
      const columnList = columns.map((c) => `"${c}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = columns.map((c) => row[c]);

      // ON CONFLICT DO NOTHING : si la ligne a été créée entre-temps des
      // deux côtés (rare mais possible), on ne l'écrase jamais.
      await to.query(
        `INSERT INTO ${table} (${columnList}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
        values,
      );
    }

    return rows.length;
  }
}
