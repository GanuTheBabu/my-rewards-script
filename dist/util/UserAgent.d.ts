import { BrowserFingerprintWithHeaders } from 'fingerprint-generator';
export declare function getUserAgent(isMobile: boolean): Promise<{
    userAgent: string;
    userAgentMetadata: {
        isMobile: boolean;
        platform: string;
        fullVersionList: {
            brand: string;
            version: string;
        }[];
        brands: {
            brand: string;
            version: string;
        }[];
        platformVersion: string;
        architecture: string;
        bitness: string;
        model: string;
    };
}>;
export declare function getChromeVersion(isMobile: boolean): Promise<string>;
export declare function getEdgeVersions(isMobile: boolean): Promise<{
    android: string | undefined;
    windows: string | undefined;
}>;
export declare function getSystemComponents(mobile: boolean): string;
export declare function getAppComponents(isMobile: boolean): Promise<{
    not_a_brand_version: string;
    not_a_brand_major_version: string;
    edge_version: string;
    edge_major_version: string;
    chrome_version: string;
    chrome_major_version: string;
    chrome_reduced_version: string;
}>;
export declare function updateFingerprintUserAgent(fingerprint: BrowserFingerprintWithHeaders, isMobile: boolean): Promise<BrowserFingerprintWithHeaders>;
//# sourceMappingURL=UserAgent.d.ts.map