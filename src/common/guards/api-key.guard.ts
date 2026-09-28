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
    const validKeys = this.configService.get<string[]>('apiKeys') || [];

    if (!providedKey || !validKeys.includes(providedKey)) {
      throw new UnauthorizedException('Clé API manquante ou invalide');
    }
    return true;
  }
}
