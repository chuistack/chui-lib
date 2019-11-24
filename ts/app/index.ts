import * as ingress from "./ingress";
import * as path from "path";
import {ChuiGlobalConfig} from "../../dist/types/config";
import {promisify} from "util";
import {
    CHUI_APP_CONFIG_DIR, CHUI_APP_CONFIG_FILENAME,
    CHUI_APP_CONFIG_SAMPLE_FILENAME,
    CHUI_APP_PULUMI_SAMPLE_CONFIG_FILENAME
} from "../constants";
import * as fs from "fs";
import {ChuiAppInstaller, ChuiBaseConfig} from "../types/config";
import * as Git from "nodegit";
import {getConfigRoot} from "../config";


export const Ingress = ingress;


const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


/**
 * Prepare the app, once it's cloned.
 *
 * @param config
 * @param app
 * @param root
 */
export const prepAppPulumiConfig = async (config: ChuiGlobalConfig, app: ChuiAppInstaller, root: string) => {
    let pulumiConfig = await readFile(path.join(
        root,
        app.directory,
        CHUI_APP_CONFIG_DIR,
        CHUI_APP_PULUMI_SAMPLE_CONFIG_FILENAME,
    ), "utf8");

    pulumiConfig = pulumiConfig.replace(/{{globalAppName}}/g, config.globalAppName);
    pulumiConfig = pulumiConfig.replace(/{{application}}/g, app.directory);
    pulumiConfig = pulumiConfig.replace(/{{pulumiOrgName}}/g, config.pulumiOrgName);

    await writeFile(path.join(
        root,
        app.directory,
        CHUI_APP_CONFIG_DIR,
        'Pulumi.yaml'
    ), pulumiConfig);
};


/**
 * Prepare the app, once it's cloned.
 *
 * @param config
 * @param app
 * @param root
 */
export const prepAppChuiConfig = async (config: ChuiGlobalConfig, app: ChuiAppInstaller, root: string) => {
    let chuiConfig = await readFile(path.join(
        root,
        app.directory,
        CHUI_APP_CONFIG_SAMPLE_FILENAME,
    ), "utf8");

    chuiConfig = chuiConfig.replace(/{{globalAppName}}/g, config.globalAppName);
    chuiConfig = chuiConfig.replace(/{{application}}/g, app.directory);

    await writeFile(path.join(
        root,
        app.directory,
        CHUI_APP_CONFIG_FILENAME,
    ), chuiConfig);
};


export const installApp = async (
    config: ChuiGlobalConfig,
    app: ChuiAppInstaller,
): Promise<ChuiGlobalConfig> => {
    const root = getConfigRoot();
    const repo = await Git.Clone.clone(app.source, path.join(root, app.directory));
    await Git.Remote.delete(repo, 'origin');
    await Git.Remote.createWithFetchspec(repo, 'chui', app.source, 'master');
    await prepAppPulumiConfig(config, app, root);
    await prepAppChuiConfig(config, app, root);

    const {apps = []} = config;
    return {
        ...config,
        apps: [...apps, app],
    };
};
