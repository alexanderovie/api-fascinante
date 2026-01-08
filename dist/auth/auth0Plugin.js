"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth0_fastify_api_1 = __importDefault(require("@auth0/auth0-fastify-api"));
const env_1 = require("../config/env");
const private_1 = __importDefault(require("../routes/private"));
const auth0Plugin = async (fastify) => {
    if (!env_1.appConfig.enableAuth) {
        fastify.log.info('Auth0 integration disabled via feature flag');
        return;
    }
    const authPlugin = auth0_fastify_api_1.default;
    await fastify.register(authPlugin, {
        domain: env_1.appConfig.auth0Domain,
        audience: env_1.appConfig.auth0Audience,
    });
    await fastify.register(private_1.default);
};
exports.default = auth0Plugin;
