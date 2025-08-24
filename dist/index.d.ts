import { Page } from 'rebrowser-playwright';
import BrowserFunc from './browser/BrowserFunc';
import BrowserUtil from './browser/BrowserUtil';
import { log } from './util/Logger';
import Util from './util/Utils';
import Activities from './functions/Activities';
import { Account } from './interface/Account';
import Axios from './util/Axios';
export declare class MicrosoftRewardsBot {
    log: typeof log;
    config: import("./interface/Config").Config;
    utils: Util;
    activities: Activities;
    browser: {
        func: BrowserFunc;
        utils: BrowserUtil;
    };
    isMobile: boolean;
    homePage: Page;
    private pointsCanCollect;
    private pointsInitial;
    private activeWorkers;
    private mobileRetryAttempts;
    private browserFactory;
    private accounts;
    private workers;
    private login;
    private accessToken;
    axios: Axios;
    constructor(isMobile: boolean);
    initialize(): Promise<void>;
    run(): Promise<void>;
    private runMaster;
    private runWorker;
    private runTasks;
    Desktop(account: Account): Promise<void>;
    Mobile(account: Account): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map