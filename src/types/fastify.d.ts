import 'fastify';
import { AuthContext } from './auth';
import { TenantContext } from './tenant';

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext | null;
    tenant: TenantContext | null;
  }

  interface FastifyInstance {
    httpErrors: {
      forbidden(message: string): Error;
      internalServerError(message: string): Error;
    };
  }
}
