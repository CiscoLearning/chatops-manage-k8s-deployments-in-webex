export class KubernetesCommand {
    constructor(props = {}) {
        this.type = props.type;
        this.deploymentName = props.deploymentName;
        this.imageTag = props.imageTag;
        this.scaleTarget = props.scaleTarget;
    }
}
