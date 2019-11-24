import {ChuiAppInstaller, ChuiBaseConfig, ChuiCompleteConfig, ChuiConfigFile,} from "../types/config";
import * as findup from "find-up";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import * as dashify from "dashify";
import {CHUI_APP_CONFIG_DIR, CHUI_CONFIG_FILENAME} from "../constants";
import {getEnv} from "../environment";
import {
    AppListValidator,
    AppValidator,
    checkAppType,
    checkAppValues,
    checkCertManagerExists,
    checkInfrastructureFirst,
    checkIngressControllerExists
} from "./validators/app";
import {checkCompleteConfigValues, CompleteConfigValidator} from "./validators/config";

let _configRoot: string | undefined = undefined;
let _initializing: boolean = false;
let _config: ChuiCompleteConfig;


/**
 * Used to set config root when using the library from outside
 * a Chui project, for example when creating a new project.
 * @param root The path to the root of a new project
 */
export const setConfigRoot = (root: string) =>
    _configRoot = root;


/**
 * Used to set whether a Chui stack is currently being initialized.
 * Some parts of the configuration functions disable validation before
 * the config file has been created.
 * @param initializing
 */
export const setInitializing = (initializing: boolean) =>
    _initializing = initializing;


/**
 * Loads the found yaml config file.
 * @param configPath
 * @private
 */
export const _loadConfigYaml = (configPath: string): ChuiConfigFile => {
    return yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
};


/**
 * Returns a domain to be used for an environment, based on the root domain.
 * @param env
 * @private
 */
export const _getEnvironmentDomain = (env: ChuiCompleteConfig): string => {
    if (env.environmentDomain) {
        return env.environmentDomain;
    }
    const kebabCased = dashify(env.environment, {condense: true});
    return `${kebabCased}.${env.rootDomain}`;
};


export const _appListValidators: AppListValidator[] = [
    checkInfrastructureFirst,
    checkIngressControllerExists,
    checkCertManagerExists,
];


/**
 * Checks that the supplied app list is valid.
 * @param apps
 */
export const validateConfigAppsList = (apps: ChuiAppInstaller[]): void =>
    !_initializing && _appListValidators.forEach(validate => validate(apps));


/**
 * Checks that the supplied app list is valid for a given complete config.
 * @param config
 */
export const validateCompleteConfigAppsList = (config: ChuiCompleteConfig): void =>
    !_initializing && validateConfigAppsList(config.apps);


/**
 * List of app checkers to run through and make sure all apps are valid.
 */
export const _singleAppValidators: AppValidator[] = [
    checkAppValues,
    checkAppType,
];


/**
 * Checks that the supplied apps are valid.
 * @param apps
 * @private
 */
export const validateConfigApps = (apps: ChuiAppInstaller[]): void =>
    !_initializing && apps.forEach(app => _singleAppValidators.forEach(validate => validate(app)));


/**
 * Pass in a complete config to validate its apps.
 * @param config
 */
export const validateCompleteConfigApps = (config: ChuiCompleteConfig) =>
    !_initializing && validateConfigApps(config.apps);


export const _completeConfigValidators: CompleteConfigValidator[] = [
    checkCompleteConfigValues,
    validateCompleteConfigAppsList,
    validateCompleteConfigApps,
];


/**
 * Check that the configuration object has all the required params.
 * @param config
 */
export const validateCompleteConfig = (config: ChuiCompleteConfig): void =>
    !_initializing && _completeConfigValidators.forEach(validator => validator(config));


/**
 * Takes the JSON loaded from the yaml file and combines the global config and config
 * for the current env.
 * @param configJson
 * @private
 */
export const _getMergedConfig = (configJson: ChuiConfigFile): ChuiCompleteConfig => {
    const env = getEnv();
    const configList = configJson.environments.filter((_env) => _env.environment === env);
    if (configList.length === 0) {
        throw Error(`No matching config for: ${env}`);
    }
    if (configList.length > 1) {
        throw Error(`More than one config for: ${env}`);
    }
    const merged = {
        ...configJson.globals,
        ...configList[0],
    };
    return {
        ...merged,
        environmentDomain: _getEnvironmentDomain(merged),
    }
};


/**
 * Searches up the directory tree until finding the a file named
 * with the CHUI_CONFIG_FILENAME.
 */
export const getConfigFile = (): string => {
    let cwd = _configRoot ? _configRoot : undefined;
    const file = findup.sync(CHUI_CONFIG_FILENAME, {
        cwd,
        type: 'file',
    });
    if (!file) {
        throw Error("No config file found.");
    }
    return file;
};


/**
 * The root path for the project.
 */
export const getConfigRoot = (): string => {
    if (_configRoot)
        return _configRoot;

    const file = getConfigFile();
    _configRoot = path.dirname(file);
    return _configRoot;
};


/**
 * Loads the full contents of the Chui config file.
 */
export const loadFullConfig = (): ChuiConfigFile => {
    const configFile = getConfigFile();

    if (!configFile)
        throw Error(`Missing Chui configuration file ${CHUI_CONFIG_FILENAME}.`);

    return _loadConfigYaml(configFile);
};


/**
 * Load just the global config.
 */
export const loadGlobalConfig = (): ChuiBaseConfig =>
    loadFullConfig().globals;


/**
 * Load the current Chui configuration. The configuration is a yaml file named chui.yml
 */
export const loadCurrentConfig = (): ChuiCompleteConfig => {
    if (_config && !_initializing)
        return _config;

    const fullConfig = loadFullConfig();

    const config = _getMergedConfig(fullConfig);

    validateCompleteConfig(config);
    _config = config;

    return _config;
};


/**
 * Get the name of the current app.
 * This should be called from within Chui apps.
 */
export const getCurrentAppName = (): string => {
    const dir = findup.sync(CHUI_APP_CONFIG_DIR, {type: 'directory'});
    if (!dir) {
        throw Error('Not in a Chui application.');
    }
    const name = path.dirname(dir).split(path.sep).pop();
    if (!name) {
        throw Error('No parent directory. Weird.');
    }
    return name;
};


/**
 * Returns the apps for the current env/conf.
 */
export const getCurrentApps = (): ChuiAppInstaller[] =>
    loadCurrentConfig().apps;



