import {loadConfigFile} from "../../config";
import * as chalk from "chalk";


/**
 * Check that the environment name is valid in the config,
 * otherwise throw an error.
 * @param name
 * @private
 */
export const validateEnv = (name: string) => {
    const configFile = loadConfigFile();
    const env = configFile.environments.find(env => env.environment === name);

    if (!env) {
        throw Error(chalk.red(`${name} is not and environment in this config.`));
    }
};