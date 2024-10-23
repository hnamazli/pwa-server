const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:hasannamaz.hn@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

app.post('/send-notification', (req, res) => {
  const { title, body } = req.body;
  const notificationPayload = { notification: { title, body } };

  const sendNotifications = subscriptions.map(subscription => {
    console.log(subscription);
    
    return webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
  });

  Promise.all(sendNotifications)
    .then(() => res.status(200).json({ message: 'Notifications sent successfully.' }))
    .catch(err => {
      console.error('Error sending notifications:', err);
      res.status(500).json({ error: 'Failed to send notifications.' });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
