import { BrowserContext, Cookie } from 'rebrowser-playwright';
import { BrowserFingerprintWithHeaders } from 'fingerprint-generator';
import { Account } from '../interface/Account';
import { Config, ConfigSaveFingerprint } from '../interface/Config';
export declare function loadAccounts(): Account[];
export declare function loadConfig(): Config;
export declare function loadSessionData(sessionPath: string, email: string, isMobile: boolean, saveFingerprint: ConfigSaveFingerprint): Promise<{
    cookies: Cookie[];
    fingerprint: BrowserFingerprintWithHeaders;
}>;
export declare function saveSessionData(sessionPath: string, browser: BrowserContext, email: string, isMobile: boolean): Promise<string>;
export declare function saveFingerprintData(sessionPath: string, email: string, isMobile: boolean, fingerpint: BrowserFingerprintWithHeaders): Promise<string>;
//# sourceMappingURL=Load.d.ts.map