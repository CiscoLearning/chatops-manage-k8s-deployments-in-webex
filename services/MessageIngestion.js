import {KubernetesCommand} from "../dto/KubernetesCommand.js";

export class MessageIngestion {
    constructor(appConfig) {
        this.actions = {
            DEPLOYMENT: "deploy",
            SCALE: "scale"
        };
        this.botId = appConfig.botId;
        this.botName = appConfig.botName;
        this.botToken = appConfig.botToken;
        this.domain = appConfig.webexDomain;
        this.messagePath = appConfig.webexMessagePath;
    }

    async determineCommand(event) {
        const message = await this._fetchMessage(event);
        return this._interpret(message);
    }

    async _fetchMessage(event) {
        const res = await fetch("https://" + this.domain + this.messagePath + "/" + event.data.id, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.botToken}`
            },
            method: "GET"
        });
        const messageData = await res.json();
        if(!messageData.text) {
            throw new Error("Could not fetch message content.");
        }
        return messageData.text;
    }

    _interpret(rawMessageText) {
        const messageText = this._stripBotName(rawMessageText);
        switch (true) {
            case messageText.toLowerCase().startsWith(this.actions.DEPLOYMENT):
                // example: "Deploy some/tag:version to deploymentName"
                this._validateDeploymentMessage(messageText);
                return this._buildDeploymentRequest(messageText);
                break;
            case messageText.toLowerCase().startsWith(this.actions.SCALE):
                // example: "Scale deploymentName-name to X"
                this._validateScaleMessage(messageText);
                return this._buildScaleRequest(messageText);
                break;
            default:
                throw new Error(`Could not interpret ChatOps command. Please start your message with one of the following: ${Object.values(this.actions).join(", ")} after tagging the bot name ${this.botName}`);
        }
    }

    _stripBotName(str) {
        const filteredArray = str.split(' ').filter(x => x !== this.botName);
        return filteredArray.join(' ');
    }

    _validateDeploymentMessage(str) {
        const strs = str.split(" ");
        if (strs.length !== 4) throw new Error(`Expecting a string in the following format: "Deploy some/tag:version to deployment-name"`);
        if (strs[1].indexOf(":") === -1) throw new Error(`Expecting a string in the following format: "Deploy some/tag:version to deployment-name"; received a malformed image tag/version: ${strs[1]}`);
        if (strs[2] !== "to") throw new Error(`Expecting a string in the following format: "Deploy some/tag:version to deployment-name"`);
    }

    _validateScaleMessage(str) {
        const strs = str.split(" ");
        if (strs.length !== 4) throw new Error(`Expecting a string in the following format: "Scale deployment-name to X"`);
        if (isNaN(parseInt(strs[3]))) throw new Error(`Expecting a numerical value for the scale target "X", in the following format: "Scale deployment-name to X"; received ${strs[3]} instead.`)
    }

    _fetchImageTag(str) {
        const strs = str.split(" ");
        return strs[1];
    }

    _fetchDeploymentName(str, type) {
        const targetIndex = type === this.actions.DEPLOYMENT ? 3 : 1;
        const strs = str.split(" ");
        return strs[targetIndex];
    }

    _fetchNumOfInstances(str) {
        const strs = str.split(" ");
        return parseInt(strs[3]);
    }

    _buildDeploymentRequest(str) {
        const imageTag = this._fetchImageTag(str);
        const deployment = this._fetchDeploymentName(str, this.actions.DEPLOYMENT);
        return new KubernetesCommand({type: this.actions.DEPLOYMENT, imageTag, deployment});
    }

    _buildScaleRequest(str) {
        const deploymentName = this._fetchDeploymentName(str, this.actions.SCALE);
        const scaleTarget = this._fetchNumOfInstances(str);
        return new KubernetesCommand({type: this.actions.SCALE, scaleTarget, deploymentName});
    }
}
