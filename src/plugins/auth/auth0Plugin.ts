import { Auth0FastifyApiOptions } from '@auth0/auth0-fastify-api';
import fastifyAuth0Api from '@auth0/auth0-fastify-api';
import fastifyPlugin from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { appConfig } from '../../config/env';
import {
  ACTIVE_ORGANIZATION_CLAIM,
  AuthContext,
  MEMBERSHIP_IDS_CLAIM,
  ORGANIZATION_IDS_CLAIM,
  ROLE_CLAIM,
  normalizeClaimList,
} from '../../types/auth';

const ensureNormalizedString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;

const parseScopeRoles = (scopeClaim: unknown): string[] => {
  if (typeof scopeClaim !== 'string') {
    return [];
  }
  return scopeClaim
    .split(' ')
    .map((value) => value.trim())
    .filter(Boolean);
};

const buildAuthContext = (user: FastifyRequest['user']): AuthContext => {
  const claims = { ...user } as Record<string, unknown>;
  const email = ensureNormalizedString(claims['email'] ?? null) ?? null;

  const rawRoles = normalizeClaimList(claims, ROLE_CLAIM);
  const scopeRoles = parseScopeRoles(claims['scope']);

  const organizationIds = normalizeClaimList(claims, ORGANIZATION_IDS_CLAIM);
  const membershipIds = normalizeClaimList(claims, MEMBERSHIP_IDS_CLAIM);
  const tenantHintsClaim = ensureNormalizedString(claims[ACTIVE_ORGANIZATION_CLAIM]);

  const issuedAt =
    typeof claims['iat'] === 'number' ? claims['iat'] : Math.floor(Date.now() / 1000);
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

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('auth', null);

  if (!appConfig.enableAuth) {
    fastify.log.info('Auth0 integration disabled via feature flag');
    fastify.addHook('preHandler', (request) => {
      request.auth = null;
    });
    return;
  }

  await fastify.register(fastifyAuth0Api as FastifyPluginAsync<Auth0FastifyApiOptions>, {
    domain: appConfig.auth0Domain!,
    audience: appConfig.auth0Audience!,
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

export default fastifyPlugin(plugin, {
  fastify: '5.x',
  name: 'plugin-auth-context',
});
