import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { appConfig } from '../../config/env';
import { ensureTenantForUser } from '../../services/tenantService';

const plugin: FastifyPluginAsync = async (fastifyInstance) => {
  fastifyInstance.decorateRequest('tenant', null);

  fastifyInstance.addHook('preHandler', async (request, reply) => {
    if (!appConfig.enableAuth) {
      return reply
        .code(403)
        .send({ message: 'Authentication disabled' });
    }

    const auth = request.auth;
    if (!auth) {
      return reply
        .code(401)
        .send({ message: 'Unauthorized: missing authentication context' });
    }

    if (!auth.userId) {
      throw fastifyInstance.httpErrors.internalServerError('AUTH_USER_ID_MISSING');
    }

    try {
      const resolvedTenant = await ensureTenantForUser(
        fastifyInstance,
        auth.userId,
        auth.email
      );

      if (!resolvedTenant) {
        return reply
          .code(403)
          .send({ message: 'Forbidden: unable to resolve tenant' });
      }

      request.tenant = resolvedTenant;
    } catch (error) {
      fastifyInstance.log.error(
        error,
        'Failed to resolve tenant context during preHandler'
      );
      return reply
        .code(403)
        .send({ message: 'Forbidden: tenant resolution failed' });
    }
  });
};

export default fastifyPlugin(plugin, {
  fastify: '5.x',
  name: 'plugin-tenant-context',
});
