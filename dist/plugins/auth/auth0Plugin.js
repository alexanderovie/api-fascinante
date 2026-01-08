"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth0_fastify_api_1 = __importDefault(require("@auth0/auth0-fastify-api"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const env_1 = require("../../config/env");
const auth_1 = require("../../types/auth");
const ensureNormalizedString = (value) => typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
const parseScopeRoles = (scopeClaim) => {
    if (typeof scopeClaim !== 'string') {
        return [];
    }
    return scopeClaim
        .split(' ')
        .map((value) => value.trim())
        .filter(Boolean);
};
const buildAuthContext = (user) => {
    const claims = { ...user };
    const email = ensureNormalizedString(claims['email'] ?? null) ?? null;
    const rawRoles = (0, auth_1.normalizeClaimList)(claims, auth_1.ROLE_CLAIM);
    const scopeRoles = parseScopeRoles(claims['scope']);
    const organizationIds = (0, auth_1.normalizeClaimList)(claims, auth_1.ORGANIZATION_IDS_CLAIM);
    const membershipIds = (0, auth_1.normalizeClaimList)(claims, auth_1.MEMBERSHIP_IDS_CLAIM);
    const tenantHintsClaim = ensureNormalizedString(claims[auth_1.ACTIVE_ORGANIZATION_CLAIM]);
    const issuedAt = typeof claims['iat'] === 'number' ? claims['iat'] : Math.floor(Date.now() / 1000);
    const expiresAt = typeof claims['exp'] === 'number' ? claims['exp'] : issuedAt + 3600;
    const userId = ensureNormalizedString(claims['sub'] ?? null) ?? '';
    return {
        authSource: 'auth0',
        userId,
        email,
        roles: Array.from(new Set([...rawRoles, ...scopeRoles])),
        membershipIds,
        organizationIds,
        issuedAt,
        expiresAt,
        claims,
        tenantHints: tenantHintsClaim ? { activeOrganizationId: tenantHintsClaim } : undefined,
    };
};
const plugin = async (fastify) => {
    fastify.decorateRequest('auth', null);
    if (!env_1.appConfig.enableAuth) {
        fastify.log.info('Auth0 integration disabled via feature flag');
        fastify.addHook('preHandler', (request) => {
            request.auth = null;
        });
        return;
    }
    await fastify.register(auth0_fastify_api_1.default, {
        domain: env_1.appConfig.auth0Domain,
        audience: env_1.appConfig.auth0Audience,
    });
    fastify.addHook('preHandler', (request) => {
        const user = request.user;
        if (!user) {
            request.auth = null;
            return;
        }
        request.auth = buildAuthContext(user);
    });
};
exports.default = (0, fastify_plugin_1.default)(plugin, {
    fastify: '5.x',
    name: 'plugin-auth-context',
});
