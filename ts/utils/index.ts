import {CHUI_ENVIRONMENT_VARIABLE} from "../constants";


/**
 * Get the current environment name.
 */
export const getEnv = () =>
    process.env[CHUI_ENVIRONMENT_VARIABLE];