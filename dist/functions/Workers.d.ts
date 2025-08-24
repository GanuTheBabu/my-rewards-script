import { Page } from 'rebrowser-playwright';
import { DashboardData } from '../interface/DashboardData';
import { MicrosoftRewardsBot } from '../index';
export declare class Workers {
    bot: MicrosoftRewardsBot;
    constructor(bot: MicrosoftRewardsBot);
    doDailySet(page: Page, data: DashboardData): Promise<void>;
    doPunchCard(page: Page, data: DashboardData): Promise<void>;
    doMorePromotions(page: Page, data: DashboardData): Promise<void>;
    private solveActivities;
}
//# sourceMappingURL=Workers.d.ts.map