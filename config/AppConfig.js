import process from 'process';

export class AppConfig {
    constructor() {
        this.botName = process.env['WEBEX_BOT_NAME'];
        this.botToken = process.env['WEBEX_BOT_TOKEN'];
        this.clusterName = process.env['CLUSTER_NAME'];
        this.clusterUrl = process.env['CLUSTER_URL'];
        this.clusterCert = process.env['CLUSTER_CERT'];
        this.encryptionSecret = process.env['WEBEX_ENCRYPTION_SECRET'];
        this.encryptionAlgorithm = process.env['WEBEX_ENCRYPTION_ALGO'];
        this.encryptionHeader = process.env['WEBEX_ENCRYPTION_HEADER'];
        this.kubernetesImageRepo = process.env['KUBERNETES_IMAGE_REPO'];
        this.clusterName = process.env['CLUSTER_NAME'];
        this.clusterUrl = process.env['CLUSTER_URL'];
        this.clusterCert = process.env['CLUSTER_CERT'];
        this.kubernetesNamespace = process.env['KUBERNETES_NAMESPACE'];
        this.kubernetesUserame = process.env['KUBERNETES_USERNAME'];
        this.kubernetesToken = process.env['KUBERNETES_TOKEN'];
        this.roomId = process.env['WEBEX_ROOM_ID'];
    }
}
