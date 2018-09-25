// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

const sgMail = require('@sendgrid/mail');

process.env.DEBUG = 'dialogflow:debug';
process.env.SENDGRID_API_KEY = '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',

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function sendEmail(agent) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const emailParam = agent.parameters.email;

    const msg = {
      to: emailParam,
      from: 'peter.fessel@gmail.com',
      subject: 'Just a quick note',
      text: 'Just saying Hi from Dialogflow...',
      html: 'Just saying <strong>Hi from Dialogflow</strong>...',
    };
    console.log(msg);
    sgMail.send(msg);

    agent.add(`What a beauty!`);
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('GetEmail', sendEmail);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
