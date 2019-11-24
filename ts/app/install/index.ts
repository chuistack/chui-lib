import {execCmd} from "../../lib/shell";

/**
 * Installs a helm repo by name/source.
 * @param name
 * @param source
 */
export const addHelmRepo = (name: string, source: string) => {
    execCmd('helm', ['repo', 'add', 'jetstack']);
    execCmd('helm', ['repo', 'update']);
};