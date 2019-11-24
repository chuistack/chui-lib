import {spawnSync} from "child_process";


/**
 * Helper to run commands. Synchronous because Pulumi (understandably)
 * relies on things happening synchronously.
 * @param cmd
 * @param args
 * @param cwd
 */
export const execCmd = (cmd: string, args?: string[], cwd?: string) => {
    if (cwd) {
        cmd = `cd ${cwd} && ${cmd}`;
    }
    const _cmd = spawnSync(cmd, args || []);

    const err = _cmd.stderr.toString();
    if (err)
        throw Error(err);

    return _cmd.stdout.toString();
};