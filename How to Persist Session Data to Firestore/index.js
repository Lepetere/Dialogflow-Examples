'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
admin.initializeApp();
let db = admin.firestore();
db.settings({timestampsInSnapshots: true});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  const sessionId = request.body.session.split("/").reverse()[0]; // or agent.session

  function writeOrderToDb (newOrder) {
    const docRef = db.collection('orders').doc(sessionId);

    return db.runTransaction(t => {
      return t.get(docRef)
      .then(doc => {
        t.set(docRef, {
          orders: admin.firestore.FieldValue.arrayUnion(newOrder)
        }, {merge: true});
        /*if (!doc.data()) {
          t.set(docRef, { orders: [newOrder] });
        }
        else {
          t.update(docRef, {
            orders: admin.firestore.FieldValue.arrayUnion(newOrder)
          });
        }*/
      });
    }).catch(err => {
      console.log(`Error writing to Firestore: ${err}`);
    });
  }

  function confirmOrder(agent) {
    const order = agent.context.get('order'),
          amount = order.parameters.amount,
          size = order.parameters.size,
          type = order.parameters.type;

    agent.add(`Confirming ${amount} ${type} in ${size}`);

    // important to return, otherwise console.logs will not appear and non-deterministic behavior will ocurr
    return writeOrderToDb({
      "type": type,
      "size": size,
      "amount": amount
    });
  }

  let intentMap = new Map();
  intentMap.set('order.confirm - yes', confirmOrder);
  agent.handleRequest(intentMap);
});
