import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { appConfig } from './config/env';
import auth0Plugin from './plugins/auth/auth0Plugin';
import postgresPlugin from './plugins/database/postgresPlugin';
import tenantPlugin from './plugins/tenant/tenantPlugin';
import registerPrivateRoutes from './routes/private';
import registerPublicRoutes from './routes/public';

const requestTimeoutMs = 120_000;
const bodyLimitBytes = 1_048_576;
const pluginTimeoutMs = 10_000;

const fastify = Fastify({
  logger: true,
  trustProxy: true,
  requestTimeout: requestTimeoutMs,
  bodyLimit: bodyLimitBytes,
  pluginTimeout: pluginTimeoutMs,
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.setSchemaErrorFormatter(() => {
  return new Error('Request validation failed');
});

fastify.setErrorHandler((error, request, reply) => {
  const fastifyError = error as { statusCode?: number; message: string };
  const statusCode =
    typeof fastifyError.statusCode === 'number' && fastifyError.statusCode >= 400
      ? fastifyError.statusCode
      : 500;
  const message = statusCode >= 500 ? 'Internal server error' : fastifyError.message;

  if (statusCode >= 500) {
    request.log.error(error as Error, 'Unhandled error');
  } else {
    request.log.warn({ err: error }, 'Request error');
  }

  return reply.code(statusCode).send({ message, statusCode });
});

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
