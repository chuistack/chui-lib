import {execSync, spawnSync} from "child_process";


/**
 * Helper to run commands. Synchronous because Pulumi (understandably)
 * relies on things happening synchronously.
 * @param cmd
 * @param args
 * @param cwd
 */
export const execCmd = (cmd: string, args?: string[], cwd?: string) => {
    execSync([
        cmd,
        ...args
    ].join(' '), {
        cwd: cwd,
    });
};