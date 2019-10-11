type environment = 'dev' | 'staging' | 'production' | string;

export interface ChuiConfig {
    environment: environment;
    globalAppName: string;
    rootDomain: string;
}