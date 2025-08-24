"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const readline_1 = __importDefault(require("readline"));
const crypto = __importStar(require("crypto"));
const Load_1 = require("../util/Load");
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
class Login {
    constructor(bot) {
        this.clientId = '0000000040170455';
        this.authBaseUrl = 'https://login.live.com/oauth20_authorize.srf';
        this.redirectUrl = 'https://login.live.com/oauth20_desktop.srf';
        this.tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
        this.scope = 'service::prod.rewardsplatform.microsoft.com::MBI_SSL';
        this.bot = bot;
    }
    async login(page, email, password) {
        try {
            // Navigate to the Bing login page
            await page.goto('https://rewards.bing.com/signin');
            await page.waitForLoadState('domcontentloaded').catch(() => { });
            await this.bot.browser.utils.reloadBadPage(page);
            // Check if account is locked
            await this.checkAccountLocked(page);
            const isLoggedIn = await page.waitForSelector('html[data-role-name="RewardsPortal"]', { timeout: 10000 }).then(() => true).catch(() => false);
            if (!isLoggedIn) {
                await this.execLogin(page, email, password);
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Logged into Microsoft successfully');
            }
            else {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Already logged in');
                // Check if account is locked
                await this.checkAccountLocked(page);
            }
            // Check if logged in to bing
            await this.checkBingLogin(page);
            // Save session
            await (0, Load_1.saveSessionData)(this.bot.config.sessionPath, page.context(), email, this.bot.isMobile);
            // We're done logging in
            this.bot.log(this.bot.isMobile, 'LOGIN', 'Logged in successfully, saved login session!');
        }
        catch (error) {
            // Throw and don't continue
            throw this.bot.log(this.bot.isMobile, 'LOGIN', 'An error occurred:' + error, 'error');
        }
    }
    async execLogin(page, email, password) {
        try {
            await this.enterEmail(page, email);
            await this.bot.utils.wait(2000);
            await this.bot.browser.utils.reloadBadPage(page);
            await this.bot.utils.wait(2000);
            await this.enterPassword(page, password);
            await this.bot.utils.wait(2000);
            // Check if account is locked
            await this.checkAccountLocked(page);
            await this.bot.browser.utils.reloadBadPage(page);
            await this.checkLoggedIn(page);
        }
        catch (error) {
            this.bot.log(this.bot.isMobile, 'LOGIN', 'An error occurred: ' + error, 'error');
        }
    }
    async enterEmail(page, email) {
        const emailInputSelector = 'input[type="email"]';
        try {
            // Wait for email field
            const emailField = await page.waitForSelector(emailInputSelector, { state: 'visible', timeout: 2000 }).catch(() => null);
            if (!emailField) {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Email field not found', 'warn');
                return;
            }
            await this.bot.utils.wait(1000);
            // Check if email is prefilled
            const emailPrefilled = await page.waitForSelector('#userDisplayName', { timeout: 5000 }).catch(() => null);
            if (emailPrefilled) {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Email already prefilled by Microsoft');
            }
            else {
                // Else clear and fill email
                await page.fill(emailInputSelector, '');
                await this.bot.utils.wait(500);
                await page.fill(emailInputSelector, email);
                await this.bot.utils.wait(1000);
            }
            const nextButton = await page.waitForSelector('button[type="submit"]', { timeout: 2000 }).catch(() => null);
            if (nextButton) {
                await nextButton.click();
                await this.bot.utils.wait(2000);
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Email entered successfully');
            }
            else {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Next button not found after email entry', 'warn');
            }
        }
        catch (error) {
            this.bot.log(this.bot.isMobile, 'LOGIN', `Email entry failed: ${error}`, 'error');
        }
    }
    async enterPassword(page, password) {
        const passwordInputSelector = 'input[type="password"]';
        try {
            // Wait for password field
            const passwordField = await page.waitForSelector(passwordInputSelector, { state: 'visible', timeout: 5000 }).catch(() => null);
            if (!passwordField) {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Password field not found, possibly 2FA required', 'warn');
                await this.handle2FA(page);
                return;
            }
            await this.bot.utils.wait(1000);
            // Clear and fill password
            await page.fill(passwordInputSelector, '');
            await this.bot.utils.wait(500);
            await page.fill(passwordInputSelector, password);
            await this.bot.utils.wait(1000);
            const nextButton = await page.waitForSelector('button[type="submit"]', { timeout: 2000 }).catch(() => null);
            if (nextButton) {
                await nextButton.click();
                await this.bot.utils.wait(2000);
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Password entered successfully');
            }
            else {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Next button not found after password entry', 'warn');
            }
        }
        catch (error) {
            this.bot.log(this.bot.isMobile, 'LOGIN', `Password entry failed: ${error}`, 'error');
            await this.handle2FA(page);
        }
    }
    async handle2FA(page) {
        try {
            const numberToPress = await this.get2FACode(page);
            if (numberToPress) {
                // Authentictor App verification
                await this.authAppVerification(page, numberToPress);
            }
            else {
                // SMS verification
                await this.authSMSVerification(page);
            }
        }
        catch (error) {
            this.bot.log(this.bot.isMobile, 'LOGIN', `2FA handling failed: ${error}`);
        }
    }
    async get2FACode(page) {
        try {
            const element = await page.waitForSelector('#displaySign', { state: 'visible', timeout: 2000 });
            return await element.textContent();
        }
        catch {
            if (this.bot.config.parallel) {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Script running in parallel, can only send 1 2FA request per account at a time!', 'log', 'yellow');
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Trying again in 60 seconds! Please wait...', 'log', 'yellow');
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const button = await page.waitForSelector('button[aria-describedby="pushNotificationsTitle errorDescription"]', { state: 'visible', timeout: 2000 }).catch(() => null);
                    if (button) {
                        await this.bot.utils.wait(60000);
                        await button.click();
                        continue;
                    }
                    else {
                        break;
                    }
                }
            }
            await page.click('button[aria-describedby="confirmSendTitle"]').catch(() => { });
            await this.bot.utils.wait(2000);
            const element = await page.waitForSelector('#displaySign', { state: 'visible', timeout: 2000 });
            return await element.textContent();
        }
    }
    async authAppVerification(page, numberToPress) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                this.bot.log(this.bot.isMobile, 'LOGIN', `Press the number ${numberToPress} on your Authenticator app to approve the login`);
                this.bot.log(this.bot.isMobile, 'LOGIN', 'If you press the wrong number or the "DENY" button, try again in 60 seconds');
                await page.waitForSelector('#i0281', { state: 'detached', timeout: 60000 });
                this.bot.log(this.bot.isMobile, 'LOGIN', 'Login successfully approved!');
                break;
            }
            catch {
                this.bot.log(this.bot.isMobile, 'LOGIN', 'The code is expired. Trying to get a new code...');
                await page.click('button[aria-describedby="pushNotificationsTitle errorDescription"]');
                numberToPress = await this.get2FACode(page);
            }
        }
    }
    async authSMSVerification(page) {
        this.bot.log(this.bot.isMobile, 'LOGIN', 'SMS 2FA code required. Waiting for user input...');
        const code = await new Promise((resolve) => {
            rl.question('Enter 2FA code:\n', (input) => {
                rl.close();
                resolve(input);
            });
        });
        await page.fill('input[name="otc"]', code);
        await page.keyboard.press('Enter');
        this.bot.log(this.bot.isMobile, 'LOGIN', '2FA code entered successfully');
    }
    async checkLoggedIn(page) {
        const targetHostname = 'rewards.bing.com';
        const targetPathname = '/';
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await this.bot.browser.utils.tryDismissAllMessages(page);
            const currentURL = new URL(page.url());
            if (currentURL.hostname === targetHostname && currentURL.pathname === targetPathname) {
                break;
            }
        }
        // Wait for login to complete
        await page.waitForSelector('html[data-role-name="RewardsPortal"]', { timeout: 10000 });
        this.bot.log(this.bot.isMobile, 'LOGIN', 'Successfully logged into the rewards portal');
    }
    async checkBingLogin(page) {
        try {
            this.bot.log(this.bot.isMobile, 'LOGIN-BING', 'Verifying Bing login');
            await page.goto('https://www.bing.com/fd/auth/signin?action=interactive&provider=windows_live_id&return_url=https%3A%2F%2Fwww.bing.com%2F');
            const maxIterations = 5;
            for (let iteration = 1; iteration <= maxIterations; iteration++) {
                const currentUrl = new URL(page.url());
                if (currentUrl.hostname === 'www.bing.com' && currentUrl.pathname === '/') {
                    await this.bot.browser.utils.tryDismissAllMessages(page);
                    const loggedIn = await this.checkBingLoginStatus(page);
                    // If mobile browser, skip this step
                    if (loggedIn || this.bot.isMobile) {
                        this.bot.log(this.bot.isMobile, 'LOGIN-BING', 'Bing login verification passed!');
                        break;
                    }
                }
                await this.bot.utils.wait(1000);
            }
        }
        catch (error) {
            this.bot.log(this.bot.isMobile, 'LOGIN-BING', 'An error occurred:' + error, 'error');
        }
    }
    async checkBingLoginStatus(page) {
        try {
            await page.waitForSelector('#id_n', { timeout: 5000 });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getMobileAccessToken(page, email) {
        const authorizeUrl = new URL(this.authBaseUrl);
        authorizeUrl.searchParams.append('response_type', 'code');
        authorizeUrl.searchParams.append('client_id', this.clientId);
        authorizeUrl.searchParams.append('redirect_uri', this.redirectUrl);
        authorizeUrl.searchParams.append('scope', this.scope);
        authorizeUrl.searchParams.append('state', crypto.randomBytes(16).toString('hex'));
        authorizeUrl.searchParams.append('access_type', 'offline_access');
        authorizeUrl.searchParams.append('login_hint', email);
        await page.goto(authorizeUrl.href);
        let currentUrl = new URL(page.url());
        let code;
        this.bot.log(this.bot.isMobile, 'LOGIN-APP', 'Waiting for authorization...');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (currentUrl.hostname === 'login.live.com' && currentUrl.pathname === '/oauth20_desktop.srf') {
                code = currentUrl.searchParams.get('code');
                break;
            }
            currentUrl = new URL(page.url());
            await this.bot.utils.wait(5000);
        }
        const body = new URLSearchParams();
        body.append('grant_type', 'authorization_code');
        body.append('client_id', this.clientId);
        body.append('code', code);
        body.append('redirect_uri', this.redirectUrl);
        const tokenRequest = {
            url: this.tokenUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: body.toString()
        };
        const tokenResponse = await this.bot.axios.request(tokenRequest);
        const tokenData = await tokenResponse.data;
        this.bot.log(this.bot.isMobile, 'LOGIN-APP', 'Successfully authorized');
        return tokenData.access_token;
    }
    async checkAccountLocked(page) {
        await this.bot.utils.wait(2000);
        const isLocked = await page.waitForSelector('#serviceAbuseLandingTitle', { state: 'visible', timeout: 1000 }).then(() => true).catch(() => false);
        if (isLocked) {
            throw this.bot.log(this.bot.isMobile, 'CHECK-LOCKED', 'This account has been locked! Remove the account from "accounts.json" and restart!', 'error');
        }
    }
}
exports.Login = Login;
//# sourceMappingURL=Login.js.map