import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function createRequireAuthGuard(fastify: FastifyInstance) {
  const handler = fastify.requireAuth();
  return async (request: FastifyRequest, reply: FastifyReply) => handler(request, reply);
}
