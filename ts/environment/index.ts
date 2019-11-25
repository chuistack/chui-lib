import {CHUI_ENVIRONMENT_VARIABLE} from "../constants";
import {ChuiEnvConfig} from "../types/config";
import {loadConfigFile, writeChuiYamlConfig} from "../config";
import {findIndex} from "lodash";


/**
 * Get the current environment name.
 */
export const getEnv = () =>
    process.env[CHUI_ENVIRONMENT_VARIABLE];


/**
 * Adds an environment to the config.
 *
 * @param name
 * @param domain
 */
export const addEnvironmentToConfig = async (name: string, domain?: string) => {
    const config = loadConfigFile();

    const environment: ChuiEnvConfig = {environment: name};
    if (domain)
        environment.environmentDomain = domain;

    const index = findIndex(config.environments, (env) => env.environment === name);

    if (index)
        config.environments[index] = environment;
    else
        config.environments.push(environment);

    await writeChuiYamlConfig(config);
};

