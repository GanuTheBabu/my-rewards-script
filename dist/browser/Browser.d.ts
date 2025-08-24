import { BrowserContext } from 'rebrowser-playwright';
import { MicrosoftRewardsBot } from '../index';
import { AccountProxy } from '../interface/Account';
declare class Browser {
    private bot;
    constructor(bot: MicrosoftRewardsBot);
    createBrowser(proxy: AccountProxy, email: string): Promise<BrowserContext>;
    generateFingerprint(): Promise<import("fingerprint-generator").BrowserFingerprintWithHeaders>;
}
export default Browser;
//# sourceMappingURL=Browser.d.ts.map