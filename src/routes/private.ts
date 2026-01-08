import { FastifyInstance } from 'fastify';
import { appConfig } from '../config/env';

export default async function registerPrivateRoutes(fastify: FastifyInstance) {
  const preHandler = appConfig.enableAuth ? fastify.requireAuth() : undefined;

  fastify.get(
    '/v1/me',
    { preHandler },
    async (request, reply) => {
      if (!appConfig.enableAuth) {
        return { message: 'auth disabled' };
      }

      const auth = request.auth;
      const tenant = request.tenant;

      if (!auth || !tenant) {
        throw fastify.httpErrors.internalServerError(
          'auth or tenant context missing'
        );
      }

      return {
        userId: auth.userId,
        email: auth.email,
        roles: auth.roles,
        tenant: {
          organizationId: tenant.organizationId,
          organizationType: tenant.organizationType,
          parentOrganizationId: tenant.parentOrganizationId,
          membershipIds: tenant.membershipIds,
        },
      };
    }
  );
}
