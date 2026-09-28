import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface AggregationResult {
  total: number;
  page: number;
  limit: number;
  data: Record<string, any>[];
}

@Injectable()
export class AggregationService {
  constructor(
    @InjectDataSource() private readonly primaryDb: DataSource,
    @InjectDataSource('secondary') private readonly secondaryDb: DataSource,
  ) {}

  /**
   * Fusionne les lignes de `table` provenant des deux bases.
   * - Dédoublonnage par `id` (un enregistrement déjà synchronisé des deux
   *   côtés n'est compté qu'une fois — la version de la base primaire gagne).
   * - Chaque ligne porte un champ `sourceDb: "primaire" | "secondaire"`.
   * - Tri par `dateColumn` (par défaut `created_at`, colonne ajoutée
   *   automatiquement par Supabase à la création d'une table — à adapter
   *   si ta table utilise un autre nom de colonne).
   * - Pagination appliquée sur l'ensemble fusionné.
   */
  async getMerged(
    table: string,
    page = 1,
    limit = 20,
    dateColumn = 'created_at',
  ): Promise<AggregationResult> {
    const [primaryRows, secondaryRows] = await Promise.all([
      this.primaryDb.query(`SELECT * FROM ${table}`),
      this.secondaryDb.query(`SELECT * FROM ${table}`),
    ]);

    const merged = new Map<string, Record<string, any>>();

    // La base secondaire est appliquée en premier, la primaire écrase
    // ensuite en cas de doublon : en cas de conflit, ta propre base fait foi.
    for (const row of secondaryRows) {
      merged.set(String(row.id), { ...row, sourceDb: 'secondaire' });
    }
    for (const row of primaryRows) {
      merged.set(String(row.id), { ...row, sourceDb: 'primaire' });
    }

    const sorted = Array.from(merged.values()).sort((a, b) => {
      const dateA = a[dateColumn] ? new Date(a[dateColumn]).getTime() : 0;
      const dateB = b[dateColumn] ? new Date(b[dateColumn]).getTime() : 0;
      return dateB - dateA; // plus récent en premier
    });

    const start = (page - 1) * limit;

    return {
      total: sorted.length,
      page,
      limit,
      data: sorted.slice(start, start + limit),
    };
  }
}
