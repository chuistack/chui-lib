import {ChuiConfig} from "../types/config";
import * as findup from "find-up";
import * as yaml from "js-yaml";
import * as fs from "fs";

let _config: ChuiConfig;

/**
 * Check that the configuration object has all the required params.
 *
 * @param config
 * @private
 */
const _checkConfig = (config: any): void => {
    if (!config) {
        throw Error(`No config for environment ${process.env['CHUI_ENV']}.`);
    }
    const params = ['environment', 'globalAppName', 'rootDomain'];
    params.forEach((value => {
        if (!config[value]) {
            throw Error(
                `Missing required parameter ${value} in Chui config for environment ${process.env['CHUI_ENV']}`
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
const _loadConfig = (configPath: string): ChuiConfig => {
    const doc = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
    const config = doc[process.env['CHUI_ENV']];
    _checkConfig(config);
    return config;
};


/**
 * Load the current Chui configuration. The configuration is a yaml file named chui.yml
 */
export const loadConfig = (): ChuiConfig => {
    if (_config)
        return _config;

    const configFile = findup.sync('chui.yml', {type: 'file'});

    if (!configFile)
        throw Error("Missing Chui configuration.");

    _config = _loadConfig(configFile);

    return _config;
};

