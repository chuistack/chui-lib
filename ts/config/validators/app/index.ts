import {ChuiAppInstaller, ChuiAppTypes} from "../../../types/config";


export type AppValidator = (app: ChuiAppInstaller) => void;
export type AppListValidator = (apps: ChuiAppInstaller[]) => void;


/**
 * Check that an app has all the required values.
 * @param app
 */
export const checkAppValues = (app: ChuiAppInstaller) => {
    if (!(app.source && app.name && app.type)) {
        throw Error('App missing values.');
    }
};


/**
 * Checks that the app type is valid.
 * @param app
 */
export const checkAppType = (app: ChuiAppInstaller) => {
    if (!Object.values(ChuiAppTypes).includes(app.type)) {
        throw Error(`${app.type} is not a valid Chui app type.`);
    }
};


/**
 * You have to put the infrastructure app first.
 * @param apps
 */
export const checkInfrastructureFirst = (apps: ChuiAppInstaller[]) => {
    const types = apps.map(app => app.type);
    if (types.includes(ChuiAppTypes.Infrastructure) &&
        types[0] !== ChuiAppTypes.Infrastructure) {
        throw Error('Infrastructure app must be first.');
    }
};


/**
 * You must install an ingress controller.
 * @param apps
 */
export const checkIngressControllerExists = (apps: ChuiAppInstaller[]) => {
    const types = apps.map(app => app.type);
    if(!types.includes(ChuiAppTypes.IngressController)){
        throw Error('Chui requires an ingress controller.');
    }
};


/**
 * You must install a cert manager.
 * @param apps
 */
export const checkCertManagerExists = (apps: ChuiAppInstaller[]) => {
    const types = apps.map(app => app.type);
    if(!types.includes(ChuiAppTypes.CertManager)){
        throw Error('Chui requires a cert manager.');
    }
};
