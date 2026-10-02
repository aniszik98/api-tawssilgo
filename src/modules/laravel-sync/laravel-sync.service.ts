import { Injectable, Logger } from '@nestjs/common';

const NAVETTE_STATUT_MAP: Record<string, string> = {
  actif: 'ACTIVE',
  en_route: 'EN_ROUTE',
  arrivee: 'TERMINEE',
  annule: 'ANNULEE',
};

@Injectable()
export class LaravelSyncService {
  private readonly logger = new Logger(LaravelSyncService.name);

  private get enabled(): boolean {
    return (process.env.SYNC_WEBHOOK_ENABLED || 'true') !== 'false';
  }

  private get webhookUrl(): string {
    return (
      process.env.LARAVEL_WEBHOOK_URL ||
      'https://api.tawssilgo.com/api/webhooks/render-sync'
    );
  }

  private get apiKey(): string {
    return process.env.SYNC_API_KEY || '';
  }

  async notify(
    entity: string,
    action: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!this.enabled) return;
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({ entity, action, data }),
      });
      if (!response.ok) {
        this.logger.warn(`Webhook ${entity}/${action} → HTTP ${response.status}`);
      }
    } catch (err: any) {
      this.logger.warn(
        `Webhook ${entity}/${action} échec : ${err?.message || 'inconnue'}`,
      );
    }
  }

  notifyColisStatut(colis: any, ancienStatut?: string): Promise<void> {
    return this.notify('colis', 'update_statut', {
      codeSuivi: colis.codeSuivi,
      statut: colis.statut,
      ancienStatut: ancienStatut ?? null,
      dateLivraison:
        colis.statut === 'livree'
          ? new Date(colis.statutLivreeAt || Date.now()).toISOString()
          : null,
    });
  }

  notifyLivreurValidation(livreur: any): Promise<void> {
    return this.notify('livreur', 'validation', {
      id: livreur.id,
      statutValidation: livreur.statut === 'actif' ? 'VALIDE' : 'REFUSE',
      validePar: livreur.validePar || '',
    });
  }

  notifyNavetteStatut(navette: any): Promise<void> {
    return this.notify('navette', 'update_statut', {
      id: navette.id,
      statut: NAVETTE_STATUT_MAP[navette.statut] || navette.statut,
    });
  }
}
