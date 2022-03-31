import express from 'express'
import {KubernetesService} from '../services/Kubernetes.js';
import {WebexNotifications} from '../services/WebexNotifications.js';
import {AppConfig} from '../config/AppConfig.js';
import {MessageInterpretation} from "../services/MessageInterpretation.js";
import {MessageIngestion} from "../services/MessageIngestion.js";

const router = express.Router();
const config = new AppConfig();
const k8s = new KubernetesService(config);
const webex = new WebexNotifications(config);
const ingestion = new MessageIngestion(config);

/* GET home page. */
router.post('/', async function(req, res) {
  const event = req.body;
  try {
    const command = await ingestion.determineCommand(event);
    const notification = await k8s.takeAction(command);
    const wbxOutput = await webex.sendNotification(event, notification);
    res.statusCode = 200;
    res.send(wbxOutput);
  } catch (e) {
    res.statusCode = 500;
    res.end('Something went terribly wrong!');
    await webex.sendNotification(e);
  }
});

export default router;
