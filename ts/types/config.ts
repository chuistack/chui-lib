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


/**
 * Describes where an app should be installed from/to.
 * The `source` should be a git repo which will be cloned.
 * The `directory` is the directory it will be cloned into.
 */
export interface ChuiAppInstaller {
    source: string;
    directory: string;
    type: ChuiAppTypes;
    variant?: ChuiAppVariants;
    version?: string;
}


/**
 * How to structure dependencies for a Chui project.
 */
interface ChuiAppDependencies {
    IngressController?: IngressControllerProviders;
    CertManager?: CertManagerProviders;
    Infrastructure?: InfrastructureProviders;
    Auth?: AuthProviders;
    Storage?: StorageProviders;
    Serverless?: ServerlessProviders;
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
    dependencies?: ChuiAppDependencies;
}


/**
 * Base configuration for a Chui project. Each of these config
 * options can be overridden per environment (though some might
 * not be advisable...)
 */
export interface ChuiBaseConfig {
    rootDomain?: string;
    globalAppName?: string;
    pulumiOrgName?: string;
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


/**
 * These are the configuration options that cannot be overridden
 * by an environment. The root domain for the app (though
 * environments can set their domain to be a separate domain),
 * the global name for the Chui project (globalAppName), and
 * the infrastructure provider.
 */
export interface ChuiGlobalConfig extends ChuiBaseConfig {
    rootDomain: string;
    globalAppName: string;
    infrastructure?: undefined | InfrastructureProviders;
    pulumiOrgName: string;
}


export type ChuiCompleteConfig = ChuiGlobalConfig & ChuiEnvConfig;

/**
 * The complete structure for a Chui config file.
 */
export interface ChuiConfigFile {
    version: string;
    globals: ChuiGlobalConfig;
    environments: ChuiEnvConfig[];
}
