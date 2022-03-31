import {KubernetesCommand} from "../dto/KubernetesCommand.js";

export class MessageInterpretation {
    constructor() {
        this.actions = {
            DEPLOYMENT: "deploy",
            SCALE: "scale"
        }
    }
}
