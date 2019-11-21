// The environment variable we set to change the current Chui Environment.
export const CHUI_ENVIRONMENT_VARIABLE = 'CHUI_ENV';

// The name of the file where the Chui configuration should be stored.
export const CHUI_CONFIG_FILENAME = 'chui.yaml';

export const CHUI_APP_CONFIG_FILENAME = 'chui-app.yaml';

export const CHUI_APP_CONFIG_SAMPLE_FILENAME = 'chui-app.sample.yaml';

export const CHUI_APP_PULUMI_CONFIG_FILENAME = 'chui.Pulumi.yaml';

// The name of the directory where a Chui app's configuration should be stored.
export const CHUI_APP_CONFIG_DIR = '.chui';

export const CHUI_INFRASTRUCTURE_REPO_BASE = 'https://github.com/chuistack/chui-infrastructure';

export const CHUI_INFRASTRUCTURE_APP = {
    directory: 'infrastructure',
    source: '', // i.e. https://github.com/chuistack/chui-infrastructure-digitalocean
};