/**
 * Builds the name of an object by their component and type.
 *
 * @param app
 * @param component
 * @param type
 */
export const buildObjectName = (app: any, component: string, type: string) =>
    `${app}-${component}-${type}`;


/**
 * Generates the name of an endpoint, assuming it's a subdomain of the root.
 *
 * @param root
 * @param subdomain
 */
export const buildEndpoint = (root: any, subdomain: string) =>
    `${subdomain}.${root}`;


/**
 * Takes a service name, and namespace ("default" by default), and returns the hostname.
 *
 * @param serviceName
 * @param namespace
 */
export const getHostnameForServiceName = (serviceName: string, namespace: string = "default") =>
    `${serviceName}.${namespace}.svc.cluster.local`;
