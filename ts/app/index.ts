import * as ingress from "./ingress";
import * as path from "path";
import {promisify} from "util";
import {
    CHUI_APP_CONFIG_DIR, CHUI_APP_CONFIG_FILENAME,
    CHUI_APP_CONFIG_SAMPLE_FILENAME, CHUI_APP_PULUMI_CONFIG_FILENAME,
    CHUI_APP_PULUMI_SAMPLE_CONFIG_FILENAME, CHUI_OFFICIAL_APP_LIST_URL
} from "../constants";
import * as fs from "fs";
import {ChuiApp, ChuiAppInstaller, ChuiAppSource, ChuiBaseConfig, ChuiConfigFile} from "../types/config";
import * as Git from "nodegit";
import {getConfigRoot, loadConfigFile, loadGlobalConfig, writeChuiYamlConfig} from "../config";
import * as yaml from "js-yaml";
import fetch from "node-fetch";


export const Ingress = ingress;


const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


let _appList: ChuiAppSource[] | undefined = undefined;


export const getChuiAppSampleConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_SAMPLE_FILENAME);


export const getChuiAppConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_FILENAME);


export const getChuiAppSamplePulumiConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_DIR, CHUI_APP_PULUMI_SAMPLE_CONFIG_FILENAME);


export const getChuiAppPulumiConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_DIR, CHUI_APP_PULUMI_CONFIG_FILENAME);


/**
 * Loads the official list of Chui apps.
 */
export const loadOfficialAppList = async (refresh?: boolean): Promise<ChuiAppSource[]> => {
    if(!refresh && _appList)
        return _appList;

    const response = await fetch(CHUI_OFFICIAL_APP_LIST_URL);
    const text = await response.text();
    _appList = yaml.safeLoad(text);
    return _appList;
};


/**
 * Prepare the app, once it's cloned.
 * @param config
 * @param app
 */
export const prepAppPulumiConfig = async (config: ChuiBaseConfig, app: ChuiAppInstaller) => {
    let pulumiConfig = await readFile(getChuiAppSamplePulumiConfigPath(app), "utf8");

    pulumiConfig = pulumiConfig.replace(/{{globalAppName}}/g, config.globalAppName);
    pulumiConfig = pulumiConfig.replace(/{{application}}/g, app.name);
    pulumiConfig = pulumiConfig.replace(/{{pulumiOrgName}}/g, config.pulumiOrgName);

    await writeFile(getChuiAppPulumiConfigPath(app), pulumiConfig);
};


/**
 * Prepare the app, once it's cloned.
 * @param config
 * @param app
 */
export const prepAppChuiConfig = async (config: ChuiBaseConfig, app: ChuiAppInstaller) => {
    let chuiConfig = await readFile(getChuiAppSampleConfigPath(app), "utf8");

    chuiConfig = chuiConfig.replace(/{{globalAppName}}/g, config.globalAppName);
    chuiConfig = chuiConfig.replace(/{{application}}/g, app.name);

    await writeFile(getChuiAppConfigPath(app), chuiConfig);
};


/**
 * Clone the app and switch the remotes so users can easily
 * tie into their own setup.
 * @param app
 */
export const cloneApp = async (app: ChuiAppInstaller) => {
    const root = getConfigRoot();
    const repo = await Git.Clone.clone(app.source, path.join(root, app.name));
    await Git.Remote.delete(repo, 'origin');
    await Git.Remote.createWithFetchspec(repo, 'chui', app.source, 'master');
};


/**
 * Loads a Chui app's config, given its name.
 * @param name
 */
export const loadChuiAppConfig = (name: string): ChuiApp => {
    const app: ChuiAppInstaller = {name: name, source: ''};
    return yaml.safeLoad(fs.readFileSync(
        getChuiAppConfigPath(app),
        'utf8'
    ));
};


/**
 * Takes an app installer, assumes the app is already installed,
 * loads its config, and adds that data to the main Chui project
 * config file.
 * @param app
 */
export const writeNewAppToConfig = async (app: ChuiAppInstaller) => {
    const configFile = loadConfigFile();
    const config = loadGlobalConfig();

    const appConfig = await loadChuiAppConfig(app.name);

    const {apps = []} = config;
    const newConfig: ChuiConfigFile = {
        ...configFile,
        globals: {
            ...configFile.globals,
            apps: [...apps, appConfig],
        }
    };

    await writeChuiYamlConfig(newConfig);
};


/**
 * Takes an app installer and installs the app. Then
 * updates the installer if needed.
 * @param app
 */
export const installApp = async (
    app: ChuiAppInstaller,
): Promise<void> => {
    const config = loadGlobalConfig();

    await cloneApp(app);
    await prepAppPulumiConfig(config, app);
    await prepAppChuiConfig(config, app);
    await writeNewAppToConfig(app);
};
