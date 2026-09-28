import { SetMetadata } from '@nestjs/common';

// Marque une route comme accessible sans clé API (ex: healthcheck, docs)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
