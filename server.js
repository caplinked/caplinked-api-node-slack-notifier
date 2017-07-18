require('dotenv').config();
var low = require('lowdb');
var CaplinkedSDK = require('caplinked-api-node');
var caplinked = new CaplinkedSDK({ apiUserToken: process.env.api_user_token, apiKey: process.env.api_key, apiSecretKey: process.env.api_secret_key });
var db = low('db.json', { storage: require('lowdb/lib/storages/file-async') });
var Slack = require('node-slackr');
slack = new Slack(process.env.slack_webhook_url, { channel: process.env.slack_channel });
db.defaults({ events: [] }).write();

function notifySlack(activityEvents) {
  activityEvents.events.forEach(function(event) {
    var dbEvents = db.get('events');
    var msg = event.user_name + ' ' + event.message;
    if (!dbEvents.find({ id: event.id }).value()) {
      dbEvents.push(event).write();
      slack.notify(msg);
    }
  });
}

setInterval(function() {
  caplinked.activities.get(process.env.workspace_id).then(function(response) {
    notifySlack(response);
  });
}, 5000);
