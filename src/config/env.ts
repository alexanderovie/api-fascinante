import { config } from 'dotenv';

config();

const port = Number(process.env.PORT ?? '8080');
if (Number.isNaN(port) || port <= 0) {
  throw new Error('PORT must be a positive number');
}

const enableAuth = String(process.env.ENABLE_AUTH ?? 'true').toLowerCase() === 'true';

const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;
const databaseUrl = process.env.DATABASE_URL;

if (enableAuth && (!auth0Domain || !auth0Audience)) {
  throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE are required when ENABLE_AUTH=true');
}

if (enableAuth && !databaseUrl) {
  throw new Error('DATABASE_URL is required when ENABLE_AUTH=true');
}

export const appConfig = {
  port,
  host: '0.0.0.0',
  enableAuth,
  auth0Domain,
  auth0Audience,
  databaseUrl,
};
