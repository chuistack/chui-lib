import {CHUI_ENVIRONMENT_VARIABLE} from "../constants";


/**
 * Get the current environment name.
 */
export const getEnv = () => {
    return process.env[CHUI_ENVIRONMENT_VARIABLE];
};