import * as ingress from "./ingress";
import * as path from "path";
import {CHUI_OFFICIAL_APP_LIST_URL} from "../constants";
import {ChuiAppInstaller, ChuiAppSource, ChuiAppTypes, ChuiBaseConfig, ChuiConfigFile} from "../types/config";
import {getConfigRoot, loadConfigFile, loadGlobalConfig, writeChuiYamlConfig} from "../config";
import * as yaml from "js-yaml";
import fetch from "node-fetch";
import * as simplegit from "simple-git/promise";
import * as chalk from "chalk";
import {getChuiAppPulumiConfigPath, loadAppChuiConfig, prepAppChuiConfig, prepAppPulumiConfig} from "./config";
import {execCmd} from "../lib/shell";


export const Ingress = ingress;


const git = simplegit();


let _appList: ChuiAppSource[] | undefined = undefined;


/**
 * Loads the official list of Chui apps.
 */
export const loadOfficialAppList = async (refresh?: boolean): Promise<ChuiAppSource[]> => {
    if (!refresh && _appList)
        return _appList;

    console.log(chalk.yellow(`Loading official app list...`));
    const response = await fetch(CHUI_OFFICIAL_APP_LIST_URL);
    const text = await response.text();
    _appList = yaml.safeLoad(text);
    return _appList;
};


/**
 * Clone the app and switch the remotes so users can easily
 * tie into their own setup.
 * @param app
 */
export const cloneApp = async (app: ChuiAppInstaller) => {
    const root = getConfigRoot();
    const appPath = path.join(root, app.name);
    console.log(`Cloning: ${chalk.blue(app.name)}`);
    await git.clone(app.source, appPath);
    await git.cwd(appPath);
    await git.removeRemote('origin');
    await git.addRemote('chui', app.source);
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

    const {
        pulumiOrgName,
        globalAppName,
        ...appConfig
    } = await loadAppChuiConfig(app.name);

    const {apps = []} = config;
    const newConfig: ChuiConfigFile = {
        ...configFile,
        globals: {
            ...configFile.globals,
            apps: app.type === ChuiAppTypes.Infrastructure ?
                [appConfig, ...apps] :
                [...apps, appConfig],
        }
    };

    await writeChuiYamlConfig(newConfig);
};


/**
 * Validate the app to be installed.
 * @param app
 * @param config
 */
export const _validateApp = (app: ChuiAppInstaller, config: ChuiBaseConfig) => {
    const isInfra = app.type === ChuiAppTypes.Infrastructure;
    const hasInfra = !!config.apps.find(
        app => app.type === ChuiAppTypes.Infrastructure
    );

    if (isInfra && hasInfra) {
        throw Error('Infrastructure already configured.');
    }
};


/**
 * Takes an app installer and installs the app. Then
 * updates the installer if needed.
 * @param app
 */
export const addApp = async (
    app: ChuiAppInstaller,
): Promise<void> => {
    const config = loadGlobalConfig();

    _validateApp(app, config);

    console.log(`About to add ${app.type}: ${chalk.blue(app.name)}`);

    await cloneApp(app);
    await prepAppPulumiConfig(config, app);
    await prepAppChuiConfig(config, app);
    await writeNewAppToConfig(app);

    const pulumiConfig = getChuiAppPulumiConfigPath(app);
    const appConfigDir = path.dirname(pulumiConfig);

    await execCmd('npm', ['install'], appConfigDir);
};
