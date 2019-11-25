import {execCmd} from "../../lib/shell";
import {ChuiAppInstaller} from "../../types/config";
import {validateEnv} from "../../environment/validate";

/**
 * Installs a helm repo by name/source.
 * @param name
 * @param source
 */
export const addHelmRepo = (name: string, source: string) => {
    execCmd('helm', ['repo', 'add', name, source]);
    execCmd('helm', ['repo', 'update']);
};


export const initializeApp = async (app: ChuiAppInstaller, env: string) => {
    validateEnv(env);
};