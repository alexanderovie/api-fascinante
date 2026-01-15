import 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthContext } from './auth';
import { TenantContext } from './tenant';

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext | null;
    tenant: TenantContext | null;
    user?: Record<string, unknown> | null;
  }

  interface FastifyInstance {
    httpErrors: {
      forbidden(message: string): Error;
      internalServerError(message: string): Error;
    };
    requireAuth(): (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void;
  }
}
