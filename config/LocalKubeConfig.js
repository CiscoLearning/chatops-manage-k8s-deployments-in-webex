export class LocalKubeConfig {
    constructor(appConfig) {
        this.user = {
            name: appConfig.kubernetesUserame,
            token: appConfig.kubernetesToken,
        };
        this.cluster = {
            name: appConfig.clusterName,
            server: appConfig.clusterUrl,
            caData: appConfig.clusterCert
        }
    }
}
