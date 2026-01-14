import { config } from 'dotenv';

config();

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const port = Number(process.env.PORT ?? '8080');
if (Number.isNaN(port) || port <= 0) {
  throw new Error('PORT must be a positive number');
}

const enableAuth = String(process.env.ENABLE_AUTH ?? 'true').toLowerCase() === 'true';

const auth0Domain = enableAuth ? requireEnv('AUTH0_DOMAIN') : process.env.AUTH0_DOMAIN;
const auth0Audience = enableAuth ? requireEnv('AUTH0_AUDIENCE') : process.env.AUTH0_AUDIENCE;
const databaseUrl = enableAuth ? requireEnv('DATABASE_URL') : process.env.DATABASE_URL;

export const appConfig = {
  port,
  host: '0.0.0.0',
  enableAuth,
  auth0Domain,
  auth0Audience,
  databaseUrl,
};
