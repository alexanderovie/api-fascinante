import fastifyAuth0Api, {
  Auth0FastifyApiOptions,
} from '@auth0/auth0-fastify-api';
import { FastifyPluginAsync } from 'fastify';
import { appConfig } from '../config/env';
import registerPrivateRoutes from '../routes/private';

const auth0Plugin: FastifyPluginAsync = async (fastify) => {
  if (!appConfig.enableAuth) {
    fastify.log.info('Auth0 integration disabled via feature flag');
    return;
  }

  const authPlugin = fastifyAuth0Api as unknown as FastifyPluginAsync<Auth0FastifyApiOptions>;

  await fastify.register(authPlugin, {
    domain: appConfig.auth0Domain!,
    audience: appConfig.auth0Audience!,
  });

  await fastify.register(registerPrivateRoutes);
};

export default auth0Plugin;
