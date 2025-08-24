"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = Webhook;
const axios_1 = __importDefault(require("axios"));
async function Webhook(configData, content) {
    const webhook = configData.webhook;
    if (!webhook.enabled || webhook.url.length < 10)
        return;
    const request = {
        method: 'POST',
        url: webhook.url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            'content': content
        }
    };
    await (0, axios_1.default)(request).catch(() => { });
}
//# sourceMappingURL=Webhook.js.map