import { BrowserContext, Page } from 'rebrowser-playwright';
import { CheerioAPI } from 'cheerio';
import { MicrosoftRewardsBot } from '../index';
import { Counters, DashboardData, MorePromotion, PromotionalItem } from './../interface/DashboardData';
import { QuizData } from './../interface/QuizData';
import { EarnablePoints } from '../interface/Points';
export default class BrowserFunc {
    private bot;
    constructor(bot: MicrosoftRewardsBot);
    /**
     * Navigate the provided page to rewards homepage
     * @param {Page} page Playwright page
    */
    goHome(page: Page): Promise<void>;
    /**
     * Fetch user dashboard data
     * @returns {DashboardData} Object of user bing rewards dashboard data
    */
    getDashboardData(): Promise<DashboardData>;
    /**
     * Get search point counters
     * @returns {Counters} Object of search counter data
    */
    getSearchPoints(): Promise<Counters>;
    /**
     * Get total earnable points with web browser
     * @returns {number} Total earnable points
    */
    getBrowserEarnablePoints(): Promise<EarnablePoints>;
    /**
     * Get total earnable points with mobile app
     * @returns {number} Total earnable points
    */
    getAppEarnablePoints(accessToken: string): Promise<{
        readToEarn: number;
        checkIn: number;
        totalEarnablePoints: number;
    }>;
    /**
     * Get current point amount
     * @returns {number} Current total point amount
    */
    getCurrentPoints(): Promise<number>;
    /**
     * Parse quiz data from provided page
     * @param {Page} page Playwright page
     * @returns {QuizData} Quiz data object
    */
    getQuizData(page: Page): Promise<QuizData>;
    waitForQuizRefresh(page: Page): Promise<boolean>;
    checkQuizCompleted(page: Page): Promise<boolean>;
    loadInCheerio(page: Page): Promise<CheerioAPI>;
    getPunchCardActivity(page: Page, activity: PromotionalItem | MorePromotion): Promise<string>;
    closeBrowser(browser: BrowserContext, email: string): Promise<void>;
}
//# sourceMappingURL=BrowserFunc.d.ts.map