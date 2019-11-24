import {ChuiAppTypes} from "../../types/config";
import {getTypeStack} from "../../stack";


/**
 * Get the ingress class annotation.
 */
export const getIngressClassAnnotation = () =>
    getTypeStack(ChuiAppTypes.IngressController)
        .getOutput('ingressClassAnnotation');


/**
 * Get the cert manager stack.
 * @private
 */
export const _getCertManagerStack = () =>
    getTypeStack(ChuiAppTypes.CertManager);


/**
 * The the issuer annotation for a production cluster.
 */
export const getProductionClusterIssuerAnnotation = () =>
    _getCertManagerStack()
        .getOutput('productionClusterIssuerAnnotation');


/**
 * The the issuer annotation for a production cluster.
 */
export const getStagingClusterIssuerAnnotation = () =>
    _getCertManagerStack()
        .getOutput('stagingClusterIssuerAnnotation');
