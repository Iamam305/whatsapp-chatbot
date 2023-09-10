import { Client, RemoteAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";
require("dotenv").config();
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
const options ={

}
const client = new Client({puppeteer:{headless: true,
  args: ['--no-sandbox','--disable-setuid-sandbox']}});

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


async function runCompletion (message:string) {
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
        runCompletion(message.body.substring(1)).then(result => message.reply(result as string));
    }
});


mongoose.connect(process.env.MONGODB_URI!).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });

    client.initialize();
});