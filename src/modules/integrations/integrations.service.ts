import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiIntegration } from './api-integration.entity';
import { ClientApi } from './client-api.entity';
import { CreateApiIntegrationDto } from './dto/create-api-integration.dto';
import { UpdateApiIntegrationDto } from './dto/update-api-integration.dto';
import { CreateClientApiDto } from './dto/create-client-api.dto';
import { getByPath } from '../../common/utils/get-by-path';
import { ColisService } from '../colis/colis.service';

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

interface SyncResult {
  ok: boolean;
  message: string;
  insertions: number;
}

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(ApiIntegration)
    private readonly apiIntegrationRepo: Repository<ApiIntegration>,
    @InjectRepository(ClientApi)
    private readonly clientApiRepo: Repository<ClientApi>,
    private readonly colisService: ColisService,
  ) {}

  // ---------- api_integrations (côté partenaire) ----------

  create(dto: CreateApiIntegrationDto) {
    return this.apiIntegrationRepo.save(this.apiIntegrationRepo.create(dto));
  }

  findAll() {
    return this.apiIntegrationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ApiIntegration> {
    const integration = await this.apiIntegrationRepo.findOne({ where: { id } });
    if (!integration) throw new NotFoundException(`Intégration ${id} introuvable`);
    return integration;
  }

  async update(id: string, dto: UpdateApiIntegrationDto): Promise<ApiIntegration> {
    const integration = await this.findOne(id);
    Object.assign(integration, dto);
    return this.apiIntegrationRepo.save(integration);
  }

  async remove(id: string): Promise<void> {
    await this.apiIntegrationRepo.delete(id);
  }

  /**
   * Déclenche l'appel à l'API externe configurée, applique le mapping JSON
   * pour transformer chaque élément reçu en colis, et les insère dans notre
   * base. C'est le mécanisme central de "connexion à une autre source de
   * données" demandé au départ, appliqué ici à une intégration partenaire.
   */
  async syncApiIntegration(id: string): Promise<SyncResult> {
    const integration = await this.findOne(id);
    const result = await this.executerSync(
      integration.urlApi,
      integration.methode || 'GET',
      integration.apiKey,
      integration.mapping,
      { partenaireRecepteurId: integration.partenaireId },
    );

    integration.syncOk = result.ok;
    integration.dernierSyncAt = new Date();
    integration.dernierSyncMessage = result.message;
    integration.syncInsertions = result.insertions;
    await this.apiIntegrationRepo.save(integration);

    return result;
  }

  // ---------- client_apis (côté client) ----------

  createClientApi(dto: CreateClientApiDto) {
    return this.clientApiRepo.save(this.clientApiRepo.create(dto));
  }

  findAllClientApis(clientId?: string) {
    return this.clientApiRepo.find({
      where: clientId ? { clientId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOneClientApi(id: string): Promise<ClientApi> {
    const clientApi = await this.clientApiRepo.findOne({ where: { id } });
    if (!clientApi) throw new NotFoundException(`Configuration API client ${id} introuvable`);
    return clientApi;
  }

  async syncClientApi(id: string): Promise<SyncResult> {
    const clientApi = await this.findOneClientApi(id);
    const result = await this.executerSync(
      clientApi.urlApi,
      'GET',
      clientApi.apiKey,
      clientApi.mapping,
      { clientId: clientApi.clientId },
    );

    clientApi.syncOk = result.ok;
    clientApi.dernierSyncAt = new Date();
    clientApi.dernierSyncMessage = result.message;
    clientApi.syncInsertions = result.insertions;
    await this.clientApiRepo.save(clientApi);

    return result;
  }

  // ---------- logique commune de synchronisation ----------

  private async executerSync(
    url: string,
    methode: string,
    apiKey: string,
    mapping: { result_path: string; map: Record<string, string> },
    champsSupplementaires: Record<string, any>,
  ): Promise<SyncResult> {
    try {
      const response = await fetch(url, {
        method: methode,
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      });

      if (!response.ok) {
        return {
          ok: false,
          message: `Échec de l'appel API externe : HTTP ${response.status}`,
          insertions: 0,
        };
      }

      const body = await response.json();
      const items = mapping.result_path ? getByPath(body, mapping.result_path) : body;

      if (!Array.isArray(items)) {
        return {
          ok: false,
          message: `Le chemin "${mapping.result_path}" ne pointe pas vers un tableau`,
          insertions: 0,
        };
      }

      let insertions = 0;
      const erreurs: string[] = [];

      for (const item of items) {
        try {
          const payload: Record<string, any> = { ...champsSupplementaires };
          for (const [champLocal, cheminDistant] of Object.entries(mapping.map)) {
            payload[toCamelCase(champLocal)] = getByPath(item, cheminDistant);
          }
          if (!payload.destination) {
            erreurs.push('Élément ignoré : champ "destination" manquant après mapping');
            continue;
          }
          await this.colisService.create(payload as any);
          insertions += 1;
        } catch (err: any) {
          erreurs.push(err?.message || 'Erreur inconnue sur un élément');
        }
      }

      return {
        ok: erreurs.length === 0,
        message:
          erreurs.length > 0
            ? `${insertions} colis importés, ${erreurs.length} erreur(s) : ${erreurs.slice(0, 3).join(' | ')}`
            : `${insertions} colis importés avec succès`,
        insertions,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: `Erreur de connexion à l'API externe : ${err?.message || 'inconnue'}`,
        insertions: 0,
      };
    }
  }
}
