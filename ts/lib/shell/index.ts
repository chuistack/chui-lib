import {spawnSync} from "child_process";


/**
 * Helper to run commands. Synchronous because Pulumi (understandably)
 * relies on things happening synchronously.
 * @param cmd
 * @param args
 */
export const execCmd = (cmd: string, args?: string[]) => {
    const _cmd = spawnSync(cmd, args || []);

    const err = _cmd.stderr.toString();
    if (err)
        throw Error(err);

    return _cmd.stdout.toString();
};