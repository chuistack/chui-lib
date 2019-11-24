import {ChuiAppTypes, ChuiConfigFile, ChuiPromptConfig, InfrastructureProviders} from "../types/config";
import {setConfigRoot, setInitializing} from "../config";
import * as fs from "fs";
import {promisify} from "util";
import * as path from "path";
import * as yaml from "js-yaml";
import {CHUI_CONFIG_FILENAME} from "../constants";
import {installApp, loadOfficialAppList} from "../app";


const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);


/**
 * Create the project root.
 * @param root
 */
export const createNewProjectRoot = async (root: string) =>
    mkdir(`./${root}`);


/**
 * Write the json config file to yaml.
 * @param jsonConfig
 */
const writeYamlConfig = async (jsonConfig: ChuiConfigFile) => {
    const {globals: {globalAppName}} = jsonConfig;
    const yamlConfig = yaml.safeDump(jsonConfig);
    await writeFile(path.join(
        '.',
        globalAppName,
        CHUI_CONFIG_FILENAME,
    ), yamlConfig);
};


/**
 * Get a full Chui json config from the options we prompted for.
 * @param config
 */
const createConfigFile = async (config: ChuiPromptConfig): Promise<ChuiConfigFile> => {
    const {
        globalAppName,
        rootDomain,
        pulumiOrgName,
    } = config;

    const configFile = {
        version: "0.1.0",
        globals: {
            globalAppName,
            rootDomain,
            pulumiOrgName,
            apps: []
        },
        environments: [
            {
                environment: 'production',
                environmentDomain: rootDomain,
            },
            {environment: 'staging'},
            {environment: 'dev'},
        ],
    };

    await writeYamlConfig(configFile);

    return configFile;
};


/**
 * Install the infrastructure app.
 * @param config
 */
export const installInfrastructure = async (config: ChuiPromptConfig) => {
    if (!config.infrastructure)
      return;
    const appList = await loadOfficialAppList();
    const app = appList.find(app =>
        app.type === ChuiAppTypes.Infrastructure &&
        app.variant === config.infrastructure
    );
    if (app) {
        await installApp({...app, name: ChuiAppTypes.Infrastructure});
    }
};


/**
 * Installs an ingress controller.
 */
export const installIngressController = async () => {
    const appList = await loadOfficialAppList();
    const app = appList.find(app => app.type === ChuiAppTypes.IngressController);
    if (app) {
        await installApp({...app, name: ChuiAppTypes.IngressController});
    }
};


/**
 * Installs a cert manager.
 */
export const installCertManager = async () => {
    const appList = await loadOfficialAppList();
    const app = appList.find(app => app.type === ChuiAppTypes.CertManager);
    if (app) {
        await installApp({...app, name: ChuiAppTypes.CertManager});
    }
};


/**
 * Install an auth app.
 * @param config
 */
export const installAuth = async (config: ChuiPromptConfig) => {
    if (!config.authProvider)
      return;
    const appList = await loadOfficialAppList();
    const app = appList.find(app =>
        app.type === ChuiAppTypes.Auth &&
        app.variant === config.authProvider
    );
    if (app) {
        await installApp({...app, name: ChuiAppTypes.Auth});
    }
};


/**
 * Install a storage app.
 * @param config
 */
export const installStorage = async (config: ChuiPromptConfig) => {
    if (!config.storageProvider)
      return;
    const appList = await loadOfficialAppList();
    const app = appList.find(app =>
        app.type === ChuiAppTypes.Storage &&
        app.variant === config.storageProvider
    );
    if (app) {
        await installApp({...app, name: ChuiAppTypes.Storage});
    }
};


/**
 * Install a serverless app.
 * @param config
 */
export const installServerless = async (config: ChuiPromptConfig) => {
    if (!config.serverlessProvider)
      return;
    const appList = await loadOfficialAppList();
    const app = appList.find(app =>
        app.type === ChuiAppTypes.Serverless &&
        app.variant === config.serverlessProvider
    );
    if (app) {
        await installApp({...app, name: ChuiAppTypes.Serverless});
    }
};


/**
 * Create a new Chui stack project.
 * @param config The config values that are normally obtained by prompting the user.
 */
export const createNewProject = async (config: ChuiPromptConfig) => {
    await createNewProjectRoot(config.globalAppName);
    await createConfigFile(config);

    setInitializing(true);
    setConfigRoot(config.globalAppName);

    await installInfrastructure(config);
    await installIngressController();
    await installCertManager();
    await installAuth(config);
    await installStorage(config);
    await installServerless(config);
};