import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { appConfig } from '../../config/env';
import { ensureTenantForUser } from '../../services/tenantService';

const plugin: FastifyPluginAsync = async (fastifyInstance) => {
  fastifyInstance.decorateRequest('tenant', null);

  fastifyInstance.addHook('preHandler', async (request) => {
    if (!appConfig.enableAuth) {
      request.tenant = null;
      return;
    }

    const auth = request.auth;
    if (!auth) {
      request.tenant = null;
      return;
    }

    if (!auth.userId) {
      throw fastifyInstance.httpErrors.internalServerError('AUTH_USER_ID_MISSING');
    }

    request.tenant = await ensureTenantForUser(
      fastifyInstance,
      auth.userId,
      auth.email
    );
  });
};

export default fastifyPlugin(plugin, {
  fastify: '5.x',
  name: 'plugin-tenant-context',
});
