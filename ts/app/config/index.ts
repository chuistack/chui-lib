import * as path from "path";
import {getConfigRoot, loadConfigFile} from "../../config";
import {
    CHUI_APP_CONFIG_DIR,
    CHUI_APP_CONFIG_FILENAME,
    CHUI_APP_CONFIG_SAMPLE_FILENAME,
    CHUI_APP_PULUMI_CONFIG_FILENAME,
    CHUI_APP_PULUMI_SAMPLE_CONFIG_FILENAME
} from "../../constants";
import {ChuiApp, ChuiAppInstaller, ChuiBaseConfig} from "../../types/config";
import * as yaml from "js-yaml";
import * as fs from "fs";
import {promisify} from "util";


const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


export const getChuiAppSampleConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_SAMPLE_FILENAME);


export const getChuiAppConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_FILENAME);


export const getChuiAppSamplePulumiConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_DIR, CHUI_APP_PULUMI_SAMPLE_CONFIG_FILENAME);


export const getChuiAppPulumiConfigPath = app =>
    path.join(getConfigRoot(), app.name, CHUI_APP_CONFIG_DIR, CHUI_APP_PULUMI_CONFIG_FILENAME);


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
 * Loads a Chui app's config, given its name.
 * @param name
 */
export const loadAppPulumiConfig = (name: string): any => {
    const app: ChuiAppInstaller = {name: name, source: ''};
    return yaml.safeLoad(fs.readFileSync(
        getChuiAppPulumiConfigPath(app),
        'utf8'
    ));
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
    chuiConfig = chuiConfig.replace(/{{pulumiOrgName}}/g, config.pulumiOrgName);

    await writeFile(getChuiAppConfigPath(app), chuiConfig);
};


/**
 * Loads a Chui app's config, given its name.
 * @param name
 */
export const loadAppChuiConfig = (name: string): ChuiApp => {
    const app: ChuiAppInstaller = {name: name, source: ''};
    return yaml.safeLoad(fs.readFileSync(
        getChuiAppConfigPath(app),
        'utf8'
    ));
};
