"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
const chalk_1 = __importDefault(require("chalk"));
const Webhook_1 = require("./Webhook");
const Load_1 = require("./Load");
function log(isMobile, title, message, type = 'log', color) {
    const configData = (0, Load_1.loadConfig)();
    if (configData.logExcludeFunc.some(x => x.toLowerCase() === title.toLowerCase())) {
        return;
    }
    const currentTime = new Date().toLocaleString();
    const platformText = isMobile === 'main' ? 'MAIN' : isMobile ? 'MOBILE' : 'DESKTOP';
    const chalkedPlatform = isMobile === 'main' ? chalk_1.default.bgCyan('MAIN') : isMobile ? chalk_1.default.bgBlue('MOBILE') : chalk_1.default.bgMagenta('DESKTOP');
    // Clean string for the Webhook (no chalk)
    const cleanStr = `[${currentTime}] [PID: ${process.pid}] [${type.toUpperCase()}] ${platformText} [${title}] ${message}`;
    // Send the clean string to the Webhook
    if (!configData.webhookLogExcludeFunc.some(x => x.toLowerCase() === title.toLowerCase())) {
        (0, Webhook_1.Webhook)(configData, cleanStr);
    }
    // Formatted string with chalk for terminal logging
    const str = `[${currentTime}] [PID: ${process.pid}] [${type.toUpperCase()}] ${chalkedPlatform} [${title}] ${message}`;
    const applyChalk = color && typeof chalk_1.default[color] === 'function' ? chalk_1.default[color] : null;
    // Log based on the type
    switch (type) {
        case 'warn':
            applyChalk ? console.warn(applyChalk(str)) : console.warn(str);
            break;
        case 'error':
            applyChalk ? console.error(applyChalk(str)) : console.error(str);
            break;
        default:
            applyChalk ? console.log(applyChalk(str)) : console.log(str);
            break;
    }
}
//# sourceMappingURL=Logger.js.map