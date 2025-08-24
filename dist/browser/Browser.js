"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rebrowser_playwright_1 = __importDefault(require("rebrowser-playwright"));
const fingerprint_injector_1 = require("fingerprint-injector");
const fingerprint_generator_1 = require("fingerprint-generator");
const Load_1 = require("../util/Load");
const UserAgent_1 = require("../util/UserAgent");
/* Test Stuff
https://abrahamjuliot.github.io/creepjs/
https://botcheck.luminati.io/
https://fv.pro/
https://pixelscan.net/
https://www.browserscan.net/
*/
class Browser {
    constructor(bot) {
        this.bot = bot;
    }
    async createBrowser(proxy, email) {
        const browser = await rebrowser_playwright_1.default.chromium.launch({
            //channel: 'msedge', // Uses Edge instead of chrome
            headless: this.bot.config.headless,
            ...(proxy.url && { proxy: { username: proxy.username, password: proxy.password, server: `${proxy.url}:${proxy.port}` } }),
            args: [
                '--no-sandbox',
                '--mute-audio',
                '--disable-setuid-sandbox',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
                '--ignore-ssl-errors'
            ]
        });
        const sessionData = await (0, Load_1.loadSessionData)(this.bot.config.sessionPath, email, this.bot.isMobile, this.bot.config.saveFingerprint);
        const fingerprint = sessionData.fingerprint ? sessionData.fingerprint : await this.generateFingerprint();
        const context = await (0, fingerprint_injector_1.newInjectedContext)(browser, { fingerprint: fingerprint });
        // Set timeout to preferred amount
        context.setDefaultTimeout(this.bot.utils.stringToMs(this.bot.config?.globalTimeout ?? 30000));
        await context.addCookies(sessionData.cookies);
        if (this.bot.config.saveFingerprint) {
            await (0, Load_1.saveFingerprintData)(this.bot.config.sessionPath, email, this.bot.isMobile, fingerprint);
        }
        this.bot.log(this.bot.isMobile, 'BROWSER', `Created browser with User-Agent: "${fingerprint.fingerprint.navigator.userAgent}"`);
        return context;
    }
    async generateFingerprint() {
        const fingerPrintData = new fingerprint_generator_1.FingerprintGenerator().getFingerprint({
            devices: this.bot.isMobile ? ['mobile'] : ['desktop'],
            operatingSystems: this.bot.isMobile ? ['android'] : ['windows'],
            browsers: [{ name: 'edge' }]
        });
        const updatedFingerPrintData = await (0, UserAgent_1.updateFingerprintUserAgent)(fingerPrintData, this.bot.isMobile);
        return updatedFingerPrintData;
    }
}
exports.default = Browser;
//# sourceMappingURL=Browser.js.map