import {ChuiPromptConfig} from "../types/config";
import {setConfigRoot, setInitializing} from "../config";
import * as fs from "fs";
import {promisify} from "util";
import {ChuiConfigFile} from "../../dist/types/config";
import * as path from "path";
import {CHUI_CONFIG_FILENAME} from "../../dist/constants";
import * as yaml from "js-yaml";


const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);


/**
 * Create the project root.
 * @param root
 */
export const createNewProjectRoot = async (root: string) =>
    mkdir(`./${root}`);


/**
 * Write the json config file to yaml.
 * @param jsonConfig
 */
const writeYamlConfig = async (jsonConfig: ChuiConfigFile) => {
    const {globals: {globalAppName}} = jsonConfig;
    await mkdir(`./${globalAppName}`);
    const yamlConfig = yaml.safeDump(jsonConfig);
    await writeFile(path.join(
        '.',
        globalAppName,
        CHUI_CONFIG_FILENAME,
    ), yamlConfig);
};


/**
 * Get a full Chui json config from the options we prompted for.
 * @param config
 */
const createConfigFile = async (config: ChuiPromptConfig): Promise<ChuiConfigFile> => {
    const {
        globalAppName,
        rootDomain,
        pulumiOrgName,
    } = config;

    const configFile = {
        version: "0.1.0",
        globals: {
            globalAppName,
            rootDomain,
            pulumiOrgName,
            apps: []
        },
        environments: [
            {
                environment: 'production',
                environmentDomain: rootDomain,
            },
            {environment: 'staging'},
            {environment: 'dev'},
        ],
    };

    await writeYamlConfig(configFile);

    return configFile;
};


/**
 * Create a new Chui stack project.
 * @param config The config values that are normally obtained by prompting the user.
 */
export const createNewProject = async (config: ChuiPromptConfig) => {
    await createNewProjectRoot(config.globalAppName);
    await createConfigFile(config);
    setInitializing(true);
    setConfigRoot(config.globalAppName);

};