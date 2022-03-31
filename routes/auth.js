import express from 'express'
import {AppConfig} from '../config/AppConfig.js';
import {Auth} from "../services/Auth.js";
import {WebexNotifications} from '../services/WebexNotifications.js';

const router = express.Router();
const config = new AppConfig();
const auth = new Auth(config);
const webex = new WebexNotifications(config);

router.all('/*', async (req, res, next) => {
    const event = req.body;
    const signedBody = req.headers[config.encryptionHeader];
    const isProperlyEncrypted = auth.isProperlyEncrypted(signedBody, event);
    if(!isProperlyEncrypted) {
        res.statusCode = 401;
        res.send("Access denied");
        return;
    }

    const isAuthorized = auth.isUserAuthorized(event);
    if(!isAuthorized) {
        res.statusCode = 403;
        res.send("Unauthorized");
        await webex.sendUnauthorizedRejection(event);
        return;
    }

    next();
});

export default router;
