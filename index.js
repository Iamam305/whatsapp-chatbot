const { Client,RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const OpenAI = require("openai");
require("dotenv").config();
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("remote_session_saved", () => {
    console.log("remote_session_saved");
  });

client.initialize();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


async function runCompletion (message) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        // stream: true,
        max_tokens: 300,
        messages: [{ role: "user", content: message }],
      });
    return response.choices[0].message.content;
}

client.on('message', message => {
    console.log(message.body);

    if(message.body.startsWith("#")) {
        runCompletion(message.body.substring(1)).then(result => message.reply(result));
    }
});


mongoose.connect(process.env.MONGODB_URI).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });

    client.initialize();
});