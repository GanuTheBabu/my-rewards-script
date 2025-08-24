import { Page } from 'rebrowser-playwright';
import { MicrosoftRewardsBot } from '../index';
export declare class Login {
    private bot;
    private clientId;
    private authBaseUrl;
    private redirectUrl;
    private tokenUrl;
    private scope;
    constructor(bot: MicrosoftRewardsBot);
    login(page: Page, email: string, password: string): Promise<void>;
    private execLogin;
    private enterEmail;
    private enterPassword;
    private handle2FA;
    private get2FACode;
    private authAppVerification;
    private authSMSVerification;
    private checkLoggedIn;
    private checkBingLogin;
    private checkBingLoginStatus;
    getMobileAccessToken(page: Page, email: string): Promise<string>;
    private checkAccountLocked;
}
//# sourceMappingURL=Login.d.ts.map