"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const postgres_1 = __importDefault(require("@fastify/postgres"));
const env_1 = require("../../config/env");
const plugin = async (fastify) => {
    if (!env_1.appConfig.databaseUrl) {
        throw new Error('DATABASE_URL is required to initialize the Postgres plugin');
    }
    await fastify.register(postgres_1.default, {
        connectionString: env_1.appConfig.databaseUrl,
    });
};
exports.default = (0, fastify_plugin_1.default)(plugin, {
    fastify: '5.x',
    name: 'plugin-postgres',
});
