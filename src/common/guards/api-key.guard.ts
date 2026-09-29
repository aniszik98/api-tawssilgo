import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Authentification simple par clé API (header x-api-key).
 * Adaptée à une utilisation serveur-à-serveur / intégration applicative,
 * sans notion de session utilisateur individuelle.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const providedKey = request.headers['x-api-key'];
    const rawKeys = this.configService.get<string>('API_KEYS') || '';
    const validKeys = rawKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    // DEBUG TEMPORAIRE - à retirer après diagnostic
    console.log('=== DEBUG API KEY ===');
    console.log('rawKeys env:', JSON.stringify(rawKeys));
    console.log('validKeys array:', JSON.stringify(validKeys));
    console.log('providedKey header:', JSON.stringify(providedKey));
    console.log('match found:', validKeys.includes(providedKey));
    console.log('======================');

    if (!providedKey || !validKeys.includes(providedKey)) {
      throw new UnauthorizedException('Clé API manquante ou invalide');
    }
    return true;
  }
}
