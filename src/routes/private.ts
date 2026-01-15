import { FastifyInstance } from 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { appConfig } from '../config/env';

const ErrorResponseSchema = Type.Object({
  message: Type.String(),
  statusCode: Type.Number(),
});

const MeResponseSchema = Type.Object({
  userId: Type.String(),
  email: Type.Union([Type.String(), Type.Null()]),
  roles: Type.Array(Type.String()),
  tenant: Type.Object({
    organizationId: Type.String(),
    organizationType: Type.Union([Type.Literal('agency'), Type.Literal('business')]),
    parentOrganizationId: Type.Union([Type.String(), Type.Null()]),
    membershipIds: Type.Array(Type.String()),
  }),
});

const requireAuthorizationHeader = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!request.headers.authorization) {
    return reply
      .code(401)
      .send({ message: 'Unauthorized: missing access token', statusCode: 401 });
  }

  return reply;
};

export default async function registerPrivateRoutes(fastify: FastifyInstance) {
  const onRequest = appConfig.enableAuth ? requireAuthorizationHeader : undefined;
  const preHandler = appConfig.enableAuth ? fastify.requireAuth() : undefined;

  fastify.get(
    '/v1/me',
    {
      onRequest,
      preHandler,
      schema: {
        response: {
          200: MeResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          500: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!appConfig.enableAuth) {
        return reply
          .code(503)
          .send({ message: 'Authentication disabled', statusCode: 503 });
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
