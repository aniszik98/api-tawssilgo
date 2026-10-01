import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Une erreur 500 arrive souvent d'une requete SQL rejetee par la base.
    // Sans ce log, le detail est perdu : le client ne recoit qu'un message
    // generique et le serveur ne garde aucune trace. On journalise la cause
    // reelle, jamais les en-tetes de la requete (ils portent x-api-key).
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // eslint-disable-next-line no-console
      console.error(
        `[${request.method}] ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erreur interne du serveur';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
