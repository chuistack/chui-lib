import {loadCurrentConfig} from "../../config";
import {CHUI_ENVIRONMENT_VARIABLE} from "../../constants";
import {validateEnv} from "../validate";
import {loadAppPulumiConfig} from "../../app/config";


/**
 * Initialize an environment.
 * @param name
 */
export const initializeEnvironment = async (name: string) => {
    validateEnv(name);
    process.env[CHUI_ENVIRONMENT_VARIABLE] = name;
    const config = loadCurrentConfig();
    const {apps} = config;

    for(let i = 0; i < apps.length; i++){
        const app = apps[i];
        const config = loadAppPulumiConfig(app.name);
        console.log(config);
    }
};
