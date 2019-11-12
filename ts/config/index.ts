import {ChuiApp, ChuiConfigFile, ChuiEnvConfig, ChuiGlobalConfig} from "../types/config";
import * as findup from "find-up";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import * as dashify from "dashify";
import {
    CHUI_CONFIG_FILENAME,
    CHUI_ENVIRONMENT_VARIABLE,
    CHUI_CORE_APP,
    CHUI_INFRASTRUCTURE_APP,
    CHUI_RESERVED_DIRS, CHUI_APP_CONFIG_DIR, CHUI_INFRASTRUCTURE_REPO_BASE
} from "../constants";
import {getEnv} from "../utils";

let _config: ChuiEnvConfig;


/**
 * Check that the configuration object has all the required params.
 *
 * @param config
 * @private
 */
export const _checkConfig = (config: any): void => {
    if (!config) {
        throw Error(`No config for environment ${process.env[CHUI_ENVIRONMENT_VARIABLE]}.`);
    }

    const params = [
        'environment',
        'globalAppName',
        'rootDomain',
    ];

    params.forEach((value => {
        if (!config[value]) {
            throw Error(
                `Missing required parameter ${value} in Chui config` +
                `for environment ${process.env[CHUI_ENVIRONMENT_VARIABLE]}`
            );
        }
    }));
};


/**
 * Loads the found yaml config file.
 *
 * @param configPath
 * @private
 */
export const _loadConfigYaml = (configPath: string): ChuiConfigFile => {
    return yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
};


/**
 * Returns a domain to be used for an environment, based on the root domain.
 *
 * @param env
 * @private
 */
export const _getEnvironmentDomain = (env: ChuiEnvConfig): string => {
    if (env.environmentDomain) {
        return env.environmentDomain;
    }
    const kebabCased = dashify(env.environment, {condense: true});
    return `${kebabCased}.${env.rootDomain}`;
};


/**
 * Checks that the supplied apps are valid.
 *
 * @param apps
 * @private
 */
export const _checkApps = (apps: ChuiApp[]): void => {
    const hasReservedDirs = apps.filter(a => {
        return CHUI_RESERVED_DIRS.indexOf(a.directory) !== -1;
    }).length > 0;

    if(hasReservedDirs){
        throw Error(`The following directories are reserved: ${
            CHUI_RESERVED_DIRS.join(', ')
        }`);
    }
};


/**
 * Gets project apps, injecting required apps and presets based on config.
 *
 * @param config
 * @private
 */
export const _getApps = (config: ChuiEnvConfig | ChuiGlobalConfig): ChuiApp[] => {
    const {infrastructure, apps = []} = config;

    _checkApps(apps);

    const chuiApps = [CHUI_CORE_APP];

    if (typeof infrastructure !== "undefined") {
        chuiApps.push({
            ...CHUI_INFRASTRUCTURE_APP,
            repo: `${CHUI_INFRASTRUCTURE_REPO_BASE}-${infrastructure}`
        });
    }

    return [...apps, ...chuiApps];
};


/**
 * Takes the JSON loaded from the yaml file and combines the global config and config
 * for the current env.
 *
 * @param configJson
 * @private
 */
export const _getMergedConfig = (configJson: ChuiConfigFile): ChuiEnvConfig => {
    const env = getEnv();
    const configList = configJson.environments.filter((_env) => _env.environment === env);
    if (configList.length === 0) {
        throw Error(`No matching config for: ${env}`);
    }
    if (configList.length > 1) {
        throw Error(`More than one config for: ${env}`);
    }
    return {
        ...configJson.globals,
        ...configList[0],
    };
};


/**
 * Get the merged environment + global config and inject required system apps.
 * @param config
 * @private
 */
export const _getConfigWithReqs = (config: ChuiEnvConfig): ChuiEnvConfig => {
    return {
        ...config,
        environmentDomain: _getEnvironmentDomain(config),
        apps: _getApps(config),
    }
};


/**
 * Searches up the directory tree until finding the a file named with the CHUI_CONFIG_FILENAME.
 */
export const findConfigFile = (cwd?: string): string => {
    const file = findup.sync(CHUI_CONFIG_FILENAME, {
        cwd,
        type: 'file',
    });
    if(!file){
        throw Error("No config file found.");
    }
    return file;
};


/**
 * Loads the full contents of the Chui config file.
 */
export const loadFullConfig = (cwd?: string): ChuiConfigFile => {
    const configFile = findConfigFile(cwd);

    if (!configFile)
        throw Error(`Missing Chui configuration file ${CHUI_CONFIG_FILENAME}.`);

    return _loadConfigYaml(configFile);
};


/**
 * Load just the global config.
 *
 * @param cwd
 */
export const loadGlobalConfig = (cwd?: string): ChuiGlobalConfig => {
    const fullConfig = loadFullConfig(cwd);
    return {
        ...fullConfig.globals,
        apps: _getApps(fullConfig.globals),
    };
};


/**
 * Load the current Chui configuration. The configuration is a yaml file named chui.yml
 */
export const loadCurrentConfig = (cwd?: string): ChuiEnvConfig => {
    if (_config)
        return _config;

    const fullConfig = loadFullConfig(cwd);

    const mergedConfig = _getMergedConfig(fullConfig);
    const withReqs = _getConfigWithReqs(mergedConfig);

    _checkConfig(withReqs);
    _config = withReqs;

    return _config;
};


/**
 * Get the name of the current app.
 */
export const getCurrentAppName = (): string => {
    const dir = findup.sync(CHUI_APP_CONFIG_DIR, {type: 'directory'});
    if(!dir){
        throw Error('Not in a Chui application.');
    }
    const name = path.dirname(dir).split(path.sep).pop();
    if(!name){
        throw Error('No parent directory. Weird.');
    }
    return name;
};

