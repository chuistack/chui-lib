type environment = 'dev' | 'staging' | 'production' | string;


export enum ChuiAppTypes {
    IngressController = 'ingress-controller',
    CertManager = 'cert-manager',
    Infrastructure = 'infrastructure',
    Auth = 'auth',
    Storage = 'storage',
    Serverless = 'serverless',
    Database = 'database',
    App = 'app',
}


export enum IngressControllerProviders {
    KubeNginx = 'kube-nginx',
}


export enum CertManagerProviders {
    CertManager = 'cert-manager',
}


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


export type ChuiAppVariants = IngressControllerProviders
    | CertManagerProviders
    | InfrastructureProviders
    | AuthProviders
    | StorageProviders
    | ServerlessProviders;


export interface ChuiAppSource {
    source: string;
    type?: ChuiAppTypes;
    variant?: ChuiAppVariants;
}


/**
 * Describes where an app should be installed from/to.
 * The `source` should be a git repo which will be cloned.
 * The `directory` is the directory it will be cloned into.
 */
export interface ChuiAppInstaller extends ChuiAppSource{
    name: string;
}


/**
 * Describes an app. The current version, where is was installed
 * from, the what it provides, and the specific variant, and a name.
 */
export interface ChuiApp {
    version: string;
    source: string;
    type: ChuiAppTypes;
    variant?: ChuiAppVariants;
    name: string;
    pulumiOrgName: string;
    dependencies?: string[];
}


/**
 * Base configuration for a Chui project. Each of these config
 * options can be overridden per environment (though some might
 * not be advisable...)
 */
export interface ChuiBaseConfig {
    rootDomain: string;
    globalAppName: string;
    pulumiOrgName: string;
    dnsSolver?: undefined | DNSSolverProviders;
    apps?: ChuiAppInstaller[];
}


/**
 * Adds an environment name and domain to the config. This
 * is used in the environment overrides in a Chui config file.
 */
export interface ChuiEnvConfig {
    environment: environment;
    environmentDomain?: string;
}


export type ChuiCompleteConfig = ChuiBaseConfig & ChuiEnvConfig;

/**
 * The config options a user is prompted for to initially
 * create the actual config file.
 */
export interface ChuiPromptConfig {
    globalAppName: string;
    rootDomain: string;
    pulumiOrgName: string;
    authProvider: AuthProviders;
    storageProvider: StorageProviders;
    serverlessProvider: ServerlessProviders;
    infrastructure?: InfrastructureProviders;
}

/**
 * The complete structure for a Chui config file.
 */
export interface ChuiConfigFile {
    version: string;
    globals: ChuiBaseConfig;
    environments: ChuiEnvConfig[];
}
