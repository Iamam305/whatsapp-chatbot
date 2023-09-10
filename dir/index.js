"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const openai_1 = __importDefault(require("openai"));
require("dotenv").config();
const wwebjs_mongo_1 = require("wwebjs-mongo");
const mongoose_1 = __importDefault(require("mongoose"));
const options = {};
const client = new whatsapp_web_js_1.Client({ puppeteer: { headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] } });
client.on("qr", (qr) => {
    qrcode_terminal_1.default.generate(qr, { small: true });
});
client.on("ready", () => {
    console.log("Client is ready!");
});
client.on("remote_session_saved", () => {
    console.log("remote_session_saved");
});
client.initialize();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function runCompletion(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            // stream: true,
            max_tokens: 300,
            messages: [{ role: "user", content: message }],
        });
        return response.choices[0].message.content;
    });
}
client.on('message', message => {
    console.log(message.body);
    if (message.body.startsWith("#")) {
        runCompletion(message.body.substring(1)).then(result => message.reply(result));
    }
});
mongoose_1.default.connect(process.env.MONGODB_URI).then(() => {
    const store = new wwebjs_mongo_1.MongoStore({ mongoose: mongoose_1.default });
    const client = new whatsapp_web_js_1.Client({
        authStrategy: new whatsapp_web_js_1.RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });
    client.initialize();
});
