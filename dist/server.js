"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const env_1 = require("./config/env");
const auth0Plugin_1 = __importDefault(require("./plugins/auth/auth0Plugin"));
const postgresPlugin_1 = __importDefault(require("./plugins/database/postgresPlugin"));
const tenantPlugin_1 = __importDefault(require("./plugins/tenant/tenantPlugin"));
const private_1 = __importDefault(require("./routes/private"));
const public_1 = __importDefault(require("./routes/public"));
const fastify = (0, fastify_1.default)({ logger: true });
const start = async () => {
    try {
        if (env_1.appConfig.databaseUrl) {
            await fastify.register(postgresPlugin_1.default);
        }
        await fastify.register(public_1.default);
        await fastify.register(async (privateScope) => {
            await privateScope.register(auth0Plugin_1.default);
            await privateScope.register(tenantPlugin_1.default);
            await privateScope.register(private_1.default);
        });
        await fastify.listen({
            port: env_1.appConfig.port,
            host: env_1.appConfig.host,
        });
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};
void start();
