import {Notification} from "../dto/Notification.js";

export class WebexNotifications {
    constructor(appConfig) {
        this.botToken = appConfig.botToken;
        this.roomId = appConfig.roomId;
        this.domain = appConfig.webexDomain;
        this.messagePath = appConfig.webexMessagePath;
    }

    async sendNotification(event, notification = new Notification()) {
        let message = `<@personEmail:${event.data.personEmail}>`;
        if (!notification.success) {
            message += ` Oh no! Something went wrong! ${notification.message}`;
        } else {
            message += ` Nicely done! ${notification.message}`;
        }
        const req = this._buildRequest(message);
        const res = await fetch(req);
        return res.json();
    }

    _buildRequest(message) {
        return new Request("https://" + this.domain + this.messagePath, {
            headers: this._setHeaders(),
            method: "POST",
            body: JSON.stringify({
                roomId: this.roomId,
                markdown: message
            })
        })
    }

    async sendUnauthorizedRejection(event) {
        return await fetch("https://" + this.domain + this.messagePath, {
            headers: this._setHeaders(),
            method: "POST",
            body: JSON.stringify({
                roomId: event.data.roomId,
                markdown: `${event.data.personEmail} is not authorized to run ChatOps commands`
            })
        });
    }

    _setHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.botToken}`
        }
    }

}
