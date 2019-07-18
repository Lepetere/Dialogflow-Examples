'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function validateEmail (agent) {
    let email = agent.parameters.email;
    if (/^\w+([\+\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(email)) {
      agent.add(agent.request_.body.queryResult.fulfillmentText);
    }
    else {
      agent.context.set({
        'name':'awaiting_email',
        'lifespan': 1
      });
      agent.add(`Please enter an email address in a valid format`);
    }
  }

  let intentMap = new Map();
  intentMap.set('Get Email', validateEmail);
  agent.handleRequest(intentMap);
});
