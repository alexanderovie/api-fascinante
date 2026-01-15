import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

const HealthResponseSchema = Type.Object({
  status: Type.Literal('Ok fue un exito'),
});

export default async function registerPublicRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/health',
    {
      schema: {
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      return reply.send({ status: 'Ok fue un exito' });
    }
  );
}
