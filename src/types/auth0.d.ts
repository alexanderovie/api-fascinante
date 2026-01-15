/// <reference types="@auth0/auth0-fastify-api" />declare module '@auth0/auth0-fastify-api' {
declare module '@auth0/auth0-fastify-api' {
  import { FastifyPluginAsync } from 'fastify';

  export interface Auth0FastifyApiOptions {
    domain: string;
    audience: string;
  }

  const plugin: FastifyPluginAsync<Auth0FastifyApiOptions>;
  export default plugin;
}
