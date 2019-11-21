import {ChuiCompleteConfig} from "../../../types/config";
import {CHUI_ENVIRONMENT_VARIABLE} from "../../../constants";


export type CompleteConfigValidator = (config: ChuiCompleteConfig) => void;


/**
 * Check that the core values exist.
 * @param config
 */
export const checkCompleteConfigValues = (config: ChuiCompleteConfig) => {
    const params = [
        'environment',
        'globalAppName',
        'rootDomain',
    ];

    params.forEach((value => {
        if (!config[value]) {
            throw Error(
                `Missing required parameter "${value}" in Chui config` +
                `for environment: ${process.env[CHUI_ENVIRONMENT_VARIABLE] || '--missing--'}`
            );
        }
    }));
};