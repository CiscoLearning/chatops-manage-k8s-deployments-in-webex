import {LocalKubeConfig} from "../config/LocalKubeConfig.js";
import {Notification} from "../dto/Notification.js"
import {KubeConfig, AppsV1Api, PatchUtils} from '@kubernetes/client-node';

export class KubernetesService {
    constructor(appConfig) {
        this.namespace = appConfig.kubernetesNamespace;
        this.imageRepo = appConfig.imageRepo;
        this.appClient = this._initAppClient(appConfig);
        this.requestOptions = { "headers": { "Content-type": PatchUtils.PATCH_FORMAT_JSON_PATCH}};
    }

    _initAppClient(appConfig) {
        const localConfig = new LocalKubeConfig(appConfig);
        const kc = new KubeConfig();
        kc.loadFromClusterAndUser(localConfig.cluster, localConfig.user);
        return kc.makeApiClient(AppsV1Api);
    }

    async takeAction(k8sCommand) {
        let result;
        switch (k8sCommand.type) {
            case "deploy":
                result = await this._updateDeploymentImage(k8sCommand);
                break;
            case "scale":
                result = await this._updateDeploymentScale(k8sCommand);
                break;
            default:
                throw new Error(`The action type ${k8sCommand.type} that was determined by the system is not supported.`);
        }
        return result;
    }

    async _updateDeploymentImage(k8sCommand) {
        // fetch the current deployment template
        const deployment = await this.appClient.readNamespacedDeployment(k8sCommand.deploymentName, this.namespace);
        // get the container object for the first container in the deployment template
        const container = deployment.spec.template.spec.containers[0];
        // update the image listed in that container object
        container.image = this.imageRepo + k8sCommand.imageTag;
        // craft a PATCH body with the updated container object
        const patch = [
            {
                "op": "replace",
                "path":"/spec/template/spec/containers",
                "value": container
            }
        ];
        // call the K8s API with a PATCH request
        const res = await this.appClient.patchNamespacedDeployment(k8sCommand.deploymentName, this.namespace, patch, undefined, undefined, undefined, undefined, this.requestOptions);
        console.log(res.body);
    }

    async _updateDeploymentScale(k8sCommand) {
        // craft a PATCH body with an updated replica count
        const patch = [
            {
                "op": "replace",
                "path":"/spec/replicas",
                "value": k8sCommand.scaleTarget
            }
        ];
        // call the K8s API with a PATCH request
        const res = await this.appClient.patchNamespacedDeployment(k8sCommand.deploymentName, this.namespace, patch, undefined, undefined, undefined, undefined, this.requestOptions);
        // validate response and return an success object to the
        return this._validateScaleResponse(k8sCommand, res.body)
    }

    _validateScaleResponse(k8sCommand, template) {
        try {
            console.log(template);
            if (template.spec.replicas === k8sCommand.scaleTarget) {
                return new Notification({
                    success: true,
                    message: `Successfully scaled to ${k8sCommand.scaleTarget} instances on the ${k8sCommand.deploymentName} deployment`
                });
            } else {
                return new Notification({
                    success: true,
                    message: `The Kubernetes API returned a replica count of ${template.spec.replicas}, which does not match the desired ${k8sCommand.scaleTarget}`
                });
            }
        } catch (e) {
            return this._createErrorHandler();
        }
    }

    _createErrorHandler() {
        return new Notification({
            success: false,
            message: `The response received from the Kubernetes API did not map correctly.  Check the Kubernetes dashboard to ensure success.`
        });
    }
}
