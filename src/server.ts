import Fastify from 'fastify';
import { appConfig } from './config/env';
import auth0Plugin from './plugins/auth/auth0Plugin';
import postgresPlugin from './plugins/database/postgresPlugin';
import tenantPlugin from './plugins/tenant/tenantPlugin';
import registerPrivateRoutes from './routes/private';
import registerPublicRoutes from './routes/public';

const fastify = Fastify({ logger: true });

const start = async () => {
  try {
    if (appConfig.databaseUrl) {
      await fastify.register(postgresPlugin);
    }

    await fastify.register(registerPublicRoutes);

    await fastify.register(async (privateScope) => {
      await privateScope.register(auth0Plugin);
      await privateScope.register(tenantPlugin);
      await privateScope.register(registerPrivateRoutes);
    });

    await fastify.listen({
      port: appConfig.port,
      host: appConfig.host,
    });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

void start();
