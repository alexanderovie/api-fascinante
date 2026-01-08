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
    fastifyInstance.addHook('preHandler', async (request) => {
        if (!env_1.appConfig.enableAuth) {
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
        request.tenant = await (0, tenantService_1.ensureTenantForUser)(fastifyInstance, auth.userId, auth.email);
    });
};
exports.default = (0, fastify_plugin_1.default)(plugin, {
    fastify: '5.x',
    name: 'plugin-tenant-context',
});
