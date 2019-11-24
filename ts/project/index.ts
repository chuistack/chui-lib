import * as Git from "nodegit";
import * as path from "path";
import * as fs from "fs";
import {promisify} from "util";
import {ChuiAppInstaller, ChuiGlobalConfig} from "../types/config";
import {
    CHUI_APP_CONFIG_DIR,
    CHUI_APP_CONFIG_FILENAME,
    CHUI_APP_CONFIG_SAMPLE_FILENAME,
    CHUI_APP_PULUMI_CONFIG_FILENAME
} from "../constants";
import Chui from "../index";


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
    CHUI_APP_PULUMI_CONFIG_FILENAME,
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
const prepAppChuiConfig = async (config: ChuiGlobalConfig, app: ChuiAppInstaller, root: string) => {
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


/**
 * Initialize the apps in the config (i.e. clone them and prep their Pulumi configs)
 *
 * @param config
 * @param root
 */
const initializeApps = async (config: ChuiGlobalConfig, root: string) => {
  const {apps = []} = config;

  const clonePromises = apps.map(async (app) => {
    const repo = await Git.Clone.clone(app.source, path.join(root, app.directory));
    await Git.Remote.delete(repo, 'origin');
    await Git.Remote.createWithFetchspec(repo, 'chui', app.source, 'master');
    return repo;
  });

  await Promise.all(clonePromises);

  const configPromises = apps.map(app => {
    return Promise.all([
      prepAppPulumiConfig(config, app, root),
      prepAppChuiConfig(config, app, root),
    ])
  });

  await Promise.all(configPromises);
};


/**
 * Initializes a new Chui project.
 * @param cwd The directory in which to initialize the project
 */
export const initializeProject = async (cwd: string) => {
  const config = Chui.Config.loadGlobalConfig(cwd);
  config.apps && await initializeApps(config, cwd);
};
