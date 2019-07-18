'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function getNameHandler(agent) {
    let name = agent.parameters.name || agent.context.get('awaiting_name').parameters.name;

    db.collection("names").add({ name: name });

    agent.add(`Thank you, ${name}`);
  }

  let intentMap = new Map();
  intentMap.set('Get Name', getNameHandler);
  intentMap.set('Confirm Name Yes', getNameHandler);
  agent.handleRequest(intentMap);
});
