"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerPublicRoutes;
async function registerPublicRoutes(fastify) {
    fastify.get('/health', async (_request, reply) => {
        return reply.send({ status: 'ok' });
    });
}
