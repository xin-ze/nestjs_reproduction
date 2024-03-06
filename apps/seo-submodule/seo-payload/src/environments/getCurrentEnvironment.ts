import type { Environment } from './environment';
import { environment as dev } from './environment';

export type EnvName = 'dev';

const environmentByName: Record<EnvName, Environment> = {
  dev
};

export function getCurrentEnvironment(
  envName: EnvName = (process.env.ENV || process.env.release_env) as EnvName
): Environment {
  return environmentByName[envName] || environmentByName.dev;
}
