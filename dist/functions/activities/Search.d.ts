import { Page } from 'rebrowser-playwright';
import { Workers } from '../Workers';
import { DashboardData } from '../../interface/DashboardData';
export declare class Search extends Workers {
    private bingHome;
    private searchPageURL;
    doSearch(page: Page, data: DashboardData): Promise<void>;
    private bingSearch;
    private getGoogleTrends;
    private extractJsonFromResponse;
    private getRelatedTerms;
    private randomScroll;
    private clickRandomLink;
    private closeTabs;
    private calculatePoints;
    private closeContinuePopup;
}
//# sourceMappingURL=Search.d.ts.map