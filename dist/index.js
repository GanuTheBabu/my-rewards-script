"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicrosoftRewardsBot = void 0;
const cluster_1 = __importDefault(require("cluster"));
const Browser_1 = __importDefault(require("./browser/Browser"));
const BrowserFunc_1 = __importDefault(require("./browser/BrowserFunc"));
const BrowserUtil_1 = __importDefault(require("./browser/BrowserUtil"));
const Logger_1 = require("./util/Logger");
const Utils_1 = __importDefault(require("./util/Utils"));
const Load_1 = require("./util/Load");
const Login_1 = require("./functions/Login");
const Workers_1 = require("./functions/Workers");
const Activities_1 = __importDefault(require("./functions/Activities"));
const Axios_1 = __importDefault(require("./util/Axios"));
// Main bot class
class MicrosoftRewardsBot {
    constructor(isMobile) {
        this.activities = new Activities_1.default(this);
        this.pointsCanCollect = 0;
        this.pointsInitial = 0;
        this.browserFactory = new Browser_1.default(this);
        this.login = new Login_1.Login(this);
        this.accessToken = '';
        this.isMobile = isMobile;
        this.log = Logger_1.log;
        this.accounts = [];
        this.utils = new Utils_1.default();
        this.workers = new Workers_1.Workers(this);
        this.browser = {
            func: new BrowserFunc_1.default(this),
            utils: new BrowserUtil_1.default(this)
        };
        this.config = (0, Load_1.loadConfig)();
        this.activeWorkers = this.config.clusters;
        this.mobileRetryAttempts = 0;
    }
    async initialize() {
        this.accounts = (0, Load_1.loadAccounts)();
    }
    async run() {
        (0, Logger_1.log)('main', 'MAIN', `Bot started with ${this.config.clusters} clusters`);
        // Only cluster when there's more than 1 cluster demanded
        if (this.config.clusters > 1) {
            if (cluster_1.default.isPrimary) {
                this.runMaster();
            }
            else {
                this.runWorker();
            }
        }
        else {
            await this.runTasks(this.accounts);
        }
    }
    runMaster() {
        (0, Logger_1.log)('main', 'MAIN-PRIMARY', 'Primary process started');
        const accountChunks = this.utils.chunkArray(this.accounts, this.config.clusters);
        for (let i = 0; i < accountChunks.length; i++) {
            const worker = cluster_1.default.fork();
            const chunk = accountChunks[i];
            worker.send({ chunk });
        }
        cluster_1.default.on('exit', (worker, code) => {
            this.activeWorkers -= 1;
            (0, Logger_1.log)('main', 'MAIN-WORKER', `Worker ${worker.process.pid} destroyed | Code: ${code} | Active workers: ${this.activeWorkers}`, 'warn');
            // Check if all workers have exited
            if (this.activeWorkers === 0) {
                (0, Logger_1.log)('main', 'MAIN-WORKER', 'All workers destroyed. Exiting main process!', 'warn');
                process.exit(0);
            }
        });
    }
    runWorker() {
        (0, Logger_1.log)('main', 'MAIN-WORKER', `Worker ${process.pid} spawned`);
        // Receive the chunk of accounts from the master
        process.on('message', async ({ chunk }) => {
            await this.runTasks(chunk);
        });
    }
    async runTasks(accounts) {
        for (const account of accounts) {
            (0, Logger_1.log)('main', 'MAIN-WORKER', `Started tasks for account ${account.email}`);
            this.axios = new Axios_1.default(account.proxy);
            if (this.config.parallel) {
                await Promise.all([
                    this.Desktop(account),
                    (() => {
                        const mobileInstance = new MicrosoftRewardsBot(true);
                        mobileInstance.axios = this.axios;
                        return mobileInstance.Mobile(account);
                    })()
                ]);
            }
            else {
                this.isMobile = false;
                await this.Desktop(account);
                this.isMobile = true;
                await this.Mobile(account);
            }
            (0, Logger_1.log)('main', 'MAIN-WORKER', `Completed tasks for account ${account.email}`, 'log', 'green');
        }
        (0, Logger_1.log)(this.isMobile, 'MAIN-PRIMARY', 'Completed tasks for ALL accounts', 'log', 'green');
        process.exit();
    }
    // Desktop
    async Desktop(account) {
        const browser = await this.browserFactory.createBrowser(account.proxy, account.email);
        this.homePage = await browser.newPage();
        (0, Logger_1.log)(this.isMobile, 'MAIN', 'Starting browser');
        // Login into MS Rewards, then go to rewards homepage
        await this.login.login(this.homePage, account.email, account.password);
        await this.browser.func.goHome(this.homePage);
        const data = await this.browser.func.getDashboardData();
        this.pointsInitial = data.userStatus.availablePoints;
        (0, Logger_1.log)(this.isMobile, 'MAIN-POINTS', `Current point count: ${this.pointsInitial}`);
        const browserEnarablePoints = await this.browser.func.getBrowserEarnablePoints();
        // Tally all the desktop points
        this.pointsCanCollect = browserEnarablePoints.dailySetPoints +
            browserEnarablePoints.desktopSearchPoints
            + browserEnarablePoints.morePromotionsPoints;
        (0, Logger_1.log)(this.isMobile, 'MAIN-POINTS', `You can earn ${this.pointsCanCollect} points today`);
        // If runOnZeroPoints is false and 0 points to earn, don't continue
        if (!this.config.runOnZeroPoints && this.pointsCanCollect === 0) {
            (0, Logger_1.log)(this.isMobile, 'MAIN', 'No points to earn and "runOnZeroPoints" is set to "false", stopping!', 'log', 'yellow');
            // Close desktop browser
            await this.browser.func.closeBrowser(browser, account.email);
            return;
        }
        // Open a new tab to where the tasks are going to be completed
        const workerPage = await browser.newPage();
        // Go to homepage on worker page
        await this.browser.func.goHome(workerPage);
        // Complete daily set
        if (this.config.workers.doDailySet) {
            await this.workers.doDailySet(workerPage, data);
        }
        // Complete more promotions
        if (this.config.workers.doMorePromotions) {
            await this.workers.doMorePromotions(workerPage, data);
        }
        // Complete punch cards
        if (this.config.workers.doPunchCards) {
            await this.workers.doPunchCard(workerPage, data);
        }
        // Do desktop searches
        if (this.config.workers.doDesktopSearch) {
            await this.activities.doSearch(workerPage, data);
        }
        // Save cookies
        await (0, Load_1.saveSessionData)(this.config.sessionPath, browser, account.email, this.isMobile);
        // Close desktop browser
        await this.browser.func.closeBrowser(browser, account.email);
        return;
    }
    // Mobile
    async Mobile(account) {
        const browser = await this.browserFactory.createBrowser(account.proxy, account.email);
        this.homePage = await browser.newPage();
        (0, Logger_1.log)(this.isMobile, 'MAIN', 'Starting browser');
        // Login into MS Rewards, then go to rewards homepage
        await this.login.login(this.homePage, account.email, account.password);
        this.accessToken = await this.login.getMobileAccessToken(this.homePage, account.email);
        await this.browser.func.goHome(this.homePage);
        const data = await this.browser.func.getDashboardData();
        const browserEnarablePoints = await this.browser.func.getBrowserEarnablePoints();
        const appEarnablePoints = await this.browser.func.getAppEarnablePoints(this.accessToken);
        this.pointsCanCollect = browserEnarablePoints.mobileSearchPoints + appEarnablePoints.totalEarnablePoints;
        (0, Logger_1.log)(this.isMobile, 'MAIN-POINTS', `You can earn ${this.pointsCanCollect} points today (Browser: ${browserEnarablePoints.mobileSearchPoints} points, App: ${appEarnablePoints.totalEarnablePoints} points)`);
        // If runOnZeroPoints is false and 0 points to earn, don't continue
        if (!this.config.runOnZeroPoints && this.pointsCanCollect === 0) {
            (0, Logger_1.log)(this.isMobile, 'MAIN', 'No points to earn and "runOnZeroPoints" is set to "false", stopping!', 'log', 'yellow');
            // Close mobile browser
            await this.browser.func.closeBrowser(browser, account.email);
            return;
        }
        // Do daily check in
        if (this.config.workers.doDailyCheckIn) {
            await this.activities.doDailyCheckIn(this.accessToken, data);
        }
        // Do read to earn
        if (this.config.workers.doReadToEarn) {
            await this.activities.doReadToEarn(this.accessToken, data);
        }
        // Do mobile searches
        if (this.config.workers.doMobileSearch) {
            // If no mobile searches data found, stop (Does not always exist on new accounts)
            if (data.userStatus.counters.mobileSearch) {
                // Open a new tab to where the tasks are going to be completed
                const workerPage = await browser.newPage();
                // Go to homepage on worker page
                await this.browser.func.goHome(workerPage);
                await this.activities.doSearch(workerPage, data);
                // Fetch current search points
                const mobileSearchPoints = (await this.browser.func.getSearchPoints()).mobileSearch?.[0];
                if (mobileSearchPoints && (mobileSearchPoints.pointProgressMax - mobileSearchPoints.pointProgress) > 0) {
                    // Increment retry count
                    this.mobileRetryAttempts++;
                }
                // Exit if retries are exhausted
                if (this.mobileRetryAttempts > this.config.searchSettings.retryMobileSearchAmount) {
                    (0, Logger_1.log)(this.isMobile, 'MAIN', `Max retry limit of ${this.config.searchSettings.retryMobileSearchAmount} reached. Exiting retry loop`, 'warn');
                }
                else if (this.mobileRetryAttempts !== 0) {
                    (0, Logger_1.log)(this.isMobile, 'MAIN', `Attempt ${this.mobileRetryAttempts}/${this.config.searchSettings.retryMobileSearchAmount}: Unable to complete mobile searches, bad User-Agent? Increase search delay? Retrying...`, 'log', 'yellow');
                    // Close mobile browser
                    await this.browser.func.closeBrowser(browser, account.email);
                    // Create a new browser and try
                    await this.Mobile(account);
                    return;
                }
            }
            else {
                (0, Logger_1.log)(this.isMobile, 'MAIN', 'Unable to fetch search points, your account is most likely too "new" for this! Try again later!', 'warn');
            }
        }
        const afterPointAmount = await this.browser.func.getCurrentPoints();
        (0, Logger_1.log)(this.isMobile, 'MAIN-POINTS', `The script collected ${afterPointAmount - this.pointsInitial} points today`);
        // Close mobile browser
        await this.browser.func.closeBrowser(browser, account.email);
        return;
    }
}
exports.MicrosoftRewardsBot = MicrosoftRewardsBot;
async function main() {
    const rewardsBot = new MicrosoftRewardsBot(false);
    try {
        await rewardsBot.initialize();
        await rewardsBot.run();
    }
    catch (error) {
        (0, Logger_1.log)(false, 'MAIN-ERROR', `Error running desktop bot: ${error}`, 'error');
    }
}
// Start the bots
main().catch(error => {
    (0, Logger_1.log)('main', 'MAIN-ERROR', `Error running bots: ${error}`, 'error');
    process.exit(1);
});
//# sourceMappingURL=index.js.map