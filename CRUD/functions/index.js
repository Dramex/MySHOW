const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const md5 = require('md5');

admin.initializeApp();

const firestore = admin.firestore();

const cors = require('cors');
const { user } = require("firebase-functions/v1/auth");
const app = express();
app.use(express.json());

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/hello', (req, res) => {
  res.end("Received GET request!");  
});

app.post('/register', async (req, res) => {
    if(!req.body.email || !req.body.name || !req.body.password) return res.json({error: "missing data"});
    let user = await firestore.collection("users").where("email", "==", req.body.email).get();
    if (!user.empty) return res.send({error: "already registered"});

    user = await firestore.collection("users").add({"name": req.body.name || "Unknown", "email": req.body.email, "password": md5(req.body.password)});

    res.json({token: user.id});
});
app.post('/login', async (req, res) => {
  let doc = await firestore.collection("users").where("email", "==", req.body.email).where("password", "==", md5(req.body.password)).get();

  if (doc.empty) return res.json({error: "user not found"});
  let user = doc.docs[0].data();
  return res.json({token: doc.docs[0].id});
});
app.get('/user/:user_id', async (req, res) => {
  let doc = await firestore.collection("users").doc(req.params.user_id).get();
  if (doc.empty) return res.json({error: "user not found"});
  let user = doc.data();
  return res.json({name: user.name || "Unknown", email: user.email});
});
// Expose Express API as a single Cloud Function:
exports.data = functions.https.onRequest(app);