import crypto from "crypto";


export class Auth {
    constructor(appConfig) {
        this.encryptionSecret = appConfig.encryptionSecret;
        this.encryptionAlgorithm = appConfig.encryptionAlgorithm;
        this.authorizedUsers = [
            "colacy@cisco.com"
        ];
    }

    isProperlyEncrypted(signedValue, messsageBody) {
        const hmac = crypto.createHmac(this.encryptionAlgorithm, this.encryptionSecret);
        hmac.write(JSON.stringify(messsageBody)); // write in to the stream
        hmac.end();       // can't read from the stream until you call end()
        const hash = hmac.read().toString('hex');
        return hash === signedValue;
    }

    isUserAuthorized(event) {
        return this.authorizedUsers.indexOf(event.data.personEmail) !== -1
    }

}
