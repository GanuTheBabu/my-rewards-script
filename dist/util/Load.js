"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAccounts = loadAccounts;
exports.loadConfig = loadConfig;
exports.loadSessionData = loadSessionData;
exports.saveSessionData = saveSessionData;
exports.saveFingerprintData = saveFingerprintData;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let configCache;
function loadAccounts() {
    try {
        let file = 'accounts.json';
        // If dev mode, use dev account(s)
        if (process.argv.includes('-dev')) {
            file = 'accounts.dev.json';
        }
        const accountDir = path_1.default.join(__dirname, '../', file);
        const accounts = fs_1.default.readFileSync(accountDir, 'utf-8');
        return JSON.parse(accounts);
    }
    catch (error) {
        throw new Error(error);
    }
}
function loadConfig() {
    try {
        if (configCache) {
            return configCache;
        }
        const configDir = path_1.default.join(__dirname, '../', 'config.json');
        const config = fs_1.default.readFileSync(configDir, 'utf-8');
        const configData = JSON.parse(config);
        configCache = configData; // Set as cache
        return configData;
    }
    catch (error) {
        throw new Error(error);
    }
}
async function loadSessionData(sessionPath, email, isMobile, saveFingerprint) {
    try {
        // Fetch cookie file
        const cookieFile = path_1.default.join(__dirname, '../browser/', sessionPath, email, `${isMobile ? 'mobile_cookies' : 'desktop_cookies'}.json`);
        let cookies = [];
        if (fs_1.default.existsSync(cookieFile)) {
            const cookiesData = await fs_1.default.promises.readFile(cookieFile, 'utf-8');
            cookies = JSON.parse(cookiesData);
        }
        // Fetch fingerprint file
        const fingerprintFile = path_1.default.join(__dirname, '../browser/', sessionPath, email, `${isMobile ? 'mobile_fingerpint' : 'desktop_fingerpint'}.json`);
        let fingerprint;
        if (((saveFingerprint.desktop && !isMobile) || (saveFingerprint.mobile && isMobile)) && fs_1.default.existsSync(fingerprintFile)) {
            const fingerprintData = await fs_1.default.promises.readFile(fingerprintFile, 'utf-8');
            fingerprint = JSON.parse(fingerprintData);
        }
        return {
            cookies: cookies,
            fingerprint: fingerprint
        };
    }
    catch (error) {
        throw new Error(error);
    }
}
async function saveSessionData(sessionPath, browser, email, isMobile) {
    try {
        const cookies = await browser.cookies();
        // Fetch path
        const sessionDir = path_1.default.join(__dirname, '../browser/', sessionPath, email);
        // Create session dir
        if (!fs_1.default.existsSync(sessionDir)) {
            await fs_1.default.promises.mkdir(sessionDir, { recursive: true });
        }
        // Save cookies to a file
        await fs_1.default.promises.writeFile(path_1.default.join(sessionDir, `${isMobile ? 'mobile_cookies' : 'desktop_cookies'}.json`), JSON.stringify(cookies));
        return sessionDir;
    }
    catch (error) {
        throw new Error(error);
    }
}
async function saveFingerprintData(sessionPath, email, isMobile, fingerpint) {
    try {
        // Fetch path
        const sessionDir = path_1.default.join(__dirname, '../browser/', sessionPath, email);
        // Create session dir
        if (!fs_1.default.existsSync(sessionDir)) {
            await fs_1.default.promises.mkdir(sessionDir, { recursive: true });
        }
        // Save fingerprint to a file
        await fs_1.default.promises.writeFile(path_1.default.join(sessionDir, `${isMobile ? 'mobile_fingerpint' : 'desktop_fingerpint'}.json`), JSON.stringify(fingerpint));
        return sessionDir;
    }
    catch (error) {
        throw new Error(error);
    }
}
//# sourceMappingURL=Load.js.map