"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const env_1 = require("../../config/env");
const tenantService_1 = require("../../services/tenantService");
const plugin = async (fastifyInstance) => {
    fastifyInstance.decorateRequest('tenant', null);
    fastifyInstance.addHook('preHandler', async (request, reply) => {
        if (!env_1.appConfig.enableAuth) {
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
            const resolvedTenant = await (0, tenantService_1.ensureTenantForUser)(fastifyInstance, auth.userId, auth.email);
            if (!resolvedTenant) {
                return reply
                    .code(403)
                    .send({ message: 'Forbidden: unable to resolve tenant' });
            }
            request.tenant = resolvedTenant;
        }
        catch (error) {
            fastifyInstance.log.error(error, 'Failed to resolve tenant context during preHandler');
            return reply
                .code(403)
                .send({ message: 'Forbidden: tenant resolution failed' });
        }
    });
};
exports.default = (0, fastify_plugin_1.default)(plugin, {
    fastify: '5.x',
    name: 'plugin-tenant-context',
});
