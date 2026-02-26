import { appConfig } from '../../../config/appConfig';

export type Auth0Config = {
  domain: string;
  clientId: string;
  audience?: string;
  /** Database connection name (e.g. Username-Password-Authentication) */
  connection: string;
};

export function getAuth0Config(): Auth0Config {
  const cfg = (appConfig as any)?.auth0 ?? {};
  const domain = (cfg.domain ?? '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  return {
    domain,
    clientId: (cfg.clientId ?? '').trim(),
    audience: cfg.audience ? String(cfg.audience).trim() : undefined,
    connection: (cfg.connection ?? 'Username-Password-Authentication').trim(),
  };
}

export const auth0Config = getAuth0Config();
