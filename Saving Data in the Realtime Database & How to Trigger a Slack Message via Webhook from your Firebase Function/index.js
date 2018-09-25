// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const requestLib = require('request');

// initialise DB connection
const admin = require('firebase-admin');
admin.initializeApp();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function saveName(agent) {
    const nameParam = agent.parameters.name;
    const context = agent.getContext('awaiting_name_confirm');
    const name = nameParam || context.parameters.name;

    agent.add(`Thank you, ` + name + `!`);
    sendSlackMessage(name);

    return admin.database().ref('/names').push({name: name}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    console.log('database write sucessful: ' + snapshot.ref.toString());
  });
  }

  function sendSlackMessage(name) {
    let slackMessageBody = {
      "username": "Get Name Chatbot",
      "text": "New submission from: " + name,
      "icon_emoji": ":tada:"
    };

    requestLib.post({
      headers: {'content-type' : 'application/json'},
      url:     "https://hooks.slack.com/services/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",
      body:    JSON.stringify(slackMessageBody)
    }, function(error, response, body) {
      console.log('Slack notification response body: ' + JSON.stringify(body) + ', error: ' + error);
    });
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Get Name', saveName);
  intentMap.set('Confirm Name Yes', saveName);
  // intentMap.set('Confirm Name Yes', getName);
  agent.handleRequest(intentMap);
});
