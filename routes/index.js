import express from 'express'
import {KubernetesService} from '../services/Kubernetes.js';
import {WebexNotifications} from '../services/WebexNotifications.js';
import {AppConfig} from '../config/AppConfig.js';
import {MessageIngestion} from "../services/MessageIngestion.js";
import {Notification} from "../dto/Notification.js"

const router = express.Router();
const config = new AppConfig();
const ingestion = new MessageIngestion(config);
const k8s = new KubernetesService(config);
const webex = new WebexNotifications(config);

router.post('/', async function(req, res) {
  const event = req.body;
  try {
    const command = await ingestion.determineCommand(event);
    const notification = await k8s.takeAction(command);
    const wbxOutput = await webex.sendNotification(event, notification);
    res.statusCode = 200;
    res.send(wbxOutput);
  } catch (e) {
    await webex.sendNotification(event, new Notification({success: false, message: e}));
    res.statusCode = 500;
    res.end('Something went terribly wrong!');
  }
});

export default router;
