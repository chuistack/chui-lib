import {ChuiAppTypes} from "../types/config";
import {loadCurrentConfig} from "../config";
import {getStack, StackReference} from "@pulumi/pulumi";


/**
 * Gets a stack reference for the particular ChuiAppType and
 * the current environment. If you haven't initialized that app
 * for the same environment, this will not work, so prep your
 * dependencies accordingly. This function only works if you
 * have a single instance of that type.
 * @param appType
 */
export const getTypeStack = (appType: ChuiAppTypes) => {
    const chui = loadCurrentConfig();
    const apps = chui.apps;
    const ingress = apps.find(app => app.type === appType);
    if (!ingress) {
        throw Error(`No ${appType} defined.`);
    }
    return new StackReference(
        `${chui.pulumiOrgName}/${chui.globalAppName}-${ingress.directory}/${getStack()}`
    );
};


/**
 * Returns a stack by name, matching the environment of the current
 * stack. If you haven't initialized that app for the same
 * environment, this will not work, so prep your dependencies
 * accordingly.
 * @param name
 */
export const getNamedStack = (name: string) => {
    const chui = loadCurrentConfig();
    const apps = chui.apps;
    const app = apps.find(app => app.directory === name);
    if (!app) {
        throw Error(`No app called "${name}" defined.`);
    }
    return new StackReference(
        `${chui.pulumiOrgName}/${chui.globalAppName}-${name}/${getStack()}`
    );
};


/**
 * Returns a stack by name, matching the environment of the current
 * stack. If you haven't initialized that app for the same
 * environment, this will not work, so prep your dependencies
 * accordingly.
 * @param source The git url for the app source.
 */
export const getSourceStack = (source: string) => {
    const chui = loadCurrentConfig();
    const apps = chui.apps;
    const app = apps.find(app => app.source === source);
    if (!app) {
        throw Error(`No app from "${source}" defined.`);
    }
    return new StackReference(
        `${chui.pulumiOrgName}/${chui.globalAppName}-${app.directory}/${getStack()}`
    );
};