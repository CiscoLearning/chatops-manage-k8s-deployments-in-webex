
export class WebexNotifications {
    constructor(appConfig) {
        this.botToken = appConfig.botToken;
        this.roomId = appConfig.roomId;
    }

    async sendNotification(event, notification) {
        let message = `<@personEmail:${event.data.personEmail}>`;
        if (!notification.success) {
            message += ` Oh no! Something went wrong! ${notification.message}`;
        } else {
            message += ` Nicely done! ${notification.message}`;
        }
        const req = this._buildRequest(event, message);
        const res = await fetch(req);
        return res.json();
    }

    _buildRequest(event, message) {
        return new Request("https://webexapis.com/v1/messages/", {
            headers: this._setHeaders(),
            method: "POST",
            body: JSON.stringify({
                roomId: event.data.roomId,
                markdown: message
            })
        })
    }

    async sendUnauthorizedRejection(event) {
        return await fetch("https://webexapis.com/v1/messages/", {
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
