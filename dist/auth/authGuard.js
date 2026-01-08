"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequireAuthGuard = createRequireAuthGuard;
function createRequireAuthGuard(fastify) {
    const handler = fastify.requireAuth();
    return async (request, reply) => handler(request, reply);
}
