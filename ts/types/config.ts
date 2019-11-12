type environment = 'dev' | 'staging' | 'production' | string;

export enum InfrastructureProviders {
    DigitalOcean = 'digitalocean',
}

export enum AuthProviders {
    KeyCloak = 'keycloak',
}

export enum StorageProviders {
    Minio = 'minio',
}

export enum ServerlessProviders {
    OpenFaas = 'openfaas',
}

export enum DNSSolverProviders {
    CloudFlare = 'cloudflare',
}

export interface ChuiApp {
    repo: string;
    directory: string;
}

export interface BaseConfig {
    rootDomain?: string;
    globalAppName?: string;
    pulumiOrgName?: string;
    infrastructure?: undefined | InfrastructureProviders;
    auth?: undefined | AuthProviders;
    storage?: undefined | StorageProviders;
    serverless?: undefined | ServerlessProviders;
    dnsSolvers?: undefined | DNSSolverProviders;
    apps?: ChuiApp[];
}

export interface ChuiEnvConfig extends BaseConfig {
    environment: environment;
    environmentDomain?: string;
}

export interface ChuiGlobalConfig extends BaseConfig {
    rootDomain: string;
    globalAppName: string;
    infrastructure?: undefined | InfrastructureProviders;
    auth?: undefined | AuthProviders;
    storage?: undefined | StorageProviders;
    serverless?: undefined | ServerlessProviders;
}

export interface ChuiConfigFile {
    version: string;
    globals: ChuiGlobalConfig;
    environments: ChuiEnvConfig[];
}
