import fastifyPlugin from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import { FastifyPluginAsync } from 'fastify';
import { appConfig } from '../../config/env';

const plugin: FastifyPluginAsync = async (fastify) => {
  if (!appConfig.databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize the Postgres plugin');
  }

  await fastify.register(fastifyPostgres, {
    connectionString: appConfig.databaseUrl,
  });
};

export default fastifyPlugin(plugin, {
  fastify: '5.x',
  name: 'plugin-postgres',
});
