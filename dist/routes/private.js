"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerPrivateRoutes;
const env_1 = require("../config/env");
async function registerPrivateRoutes(fastify) {
    const preHandler = env_1.appConfig.enableAuth ? fastify.requireAuth() : undefined;
    fastify.get('/v1/me', { preHandler }, async (request, reply) => {
        if (!env_1.appConfig.enableAuth) {
            return { message: 'auth disabled' };
        }
        const auth = request.auth;
        const tenant = request.tenant;
        if (!auth || !tenant) {
            throw fastify.httpErrors.internalServerError('auth or tenant context missing');
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
    });
}
