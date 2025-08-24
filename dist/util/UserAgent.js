"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgent = getUserAgent;
exports.getChromeVersion = getChromeVersion;
exports.getEdgeVersions = getEdgeVersions;
exports.getSystemComponents = getSystemComponents;
exports.getAppComponents = getAppComponents;
exports.updateFingerprintUserAgent = updateFingerprintUserAgent;
const axios_1 = __importDefault(require("axios"));
const Logger_1 = require("./Logger");
const NOT_A_BRAND_VERSION = '99';
async function getUserAgent(isMobile) {
    const system = getSystemComponents(isMobile);
    const app = await getAppComponents(isMobile);
    const uaTemplate = isMobile ?
        `Mozilla/5.0 (${system}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${app.chrome_reduced_version} Mobile Safari/537.36 EdgA/${app.edge_version}` :
        `Mozilla/5.0 (${system}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${app.chrome_reduced_version} Safari/537.36 Edg/${app.edge_version}`;
    const platformVersion = `${isMobile ? Math.floor(Math.random() * 5) + 9 : Math.floor(Math.random() * 15) + 1}.0.0`;
    const uaMetadata = {
        isMobile,
        platform: isMobile ? 'Android' : 'Windows',
        fullVersionList: [
            { brand: 'Not/A)Brand', version: `${NOT_A_BRAND_VERSION}.0.0.0` },
            { brand: 'Microsoft Edge', version: app['edge_version'] },
            { brand: 'Chromium', version: app['chrome_version'] }
        ],
        brands: [
            { brand: 'Not/A)Brand', version: NOT_A_BRAND_VERSION },
            { brand: 'Microsoft Edge', version: app['edge_major_version'] },
            { brand: 'Chromium', version: app['chrome_major_version'] }
        ],
        platformVersion,
        architecture: isMobile ? '' : 'x86',
        bitness: isMobile ? '' : '64',
        model: ''
    };
    return { userAgent: uaTemplate, userAgentMetadata: uaMetadata };
}
async function getChromeVersion(isMobile) {
    try {
        const request = {
            url: 'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await (0, axios_1.default)(request);
        const data = response.data;
        return data.channels.Stable.version;
    }
    catch (error) {
        throw (0, Logger_1.log)(isMobile, 'USERAGENT-CHROME-VERSION', 'An error occurred:' + error, 'error');
    }
}
async function getEdgeVersions(isMobile) {
    try {
        const request = {
            url: 'https://edgeupdates.microsoft.com/api/products',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await (0, axios_1.default)(request);
        const data = response.data;
        const stable = data.find(x => x.Product == 'Stable');
        return {
            android: stable.Releases.find(x => x.Platform == 'Android')?.ProductVersion,
            windows: stable.Releases.find(x => (x.Platform == 'Windows' && x.Architecture == 'x64'))?.ProductVersion
        };
    }
    catch (error) {
        throw (0, Logger_1.log)(isMobile, 'USERAGENT-EDGE-VERSION', 'An error occurred:' + error, 'error');
    }
}
function getSystemComponents(mobile) {
    const osId = mobile ? 'Linux' : 'Windows NT 10.0';
    const uaPlatform = mobile ? `Android 1${Math.floor(Math.random() * 5)}` : 'Win64; x64';
    if (mobile) {
        return `${uaPlatform}; ${osId}; K`;
    }
    return `${uaPlatform}; ${osId}`;
}
async function getAppComponents(isMobile) {
    const versions = await getEdgeVersions(isMobile);
    const edgeVersion = isMobile ? versions.android : versions.windows;
    const edgeMajorVersion = edgeVersion?.split('.')[0];
    const chromeVersion = await getChromeVersion(isMobile);
    const chromeMajorVersion = chromeVersion?.split('.')[0];
    const chromeReducedVersion = `${chromeMajorVersion}.0.0.0`;
    return {
        not_a_brand_version: `${NOT_A_BRAND_VERSION}.0.0.0`,
        not_a_brand_major_version: NOT_A_BRAND_VERSION,
        edge_version: edgeVersion,
        edge_major_version: edgeMajorVersion,
        chrome_version: chromeVersion,
        chrome_major_version: chromeMajorVersion,
        chrome_reduced_version: chromeReducedVersion
    };
}
async function updateFingerprintUserAgent(fingerprint, isMobile) {
    try {
        const userAgentData = await getUserAgent(isMobile);
        const componentData = await getAppComponents(isMobile);
        //@ts-expect-error Errors due it not exactly matching
        fingerprint.fingerprint.navigator.userAgentData = userAgentData.userAgentMetadata;
        fingerprint.fingerprint.navigator.userAgent = userAgentData.userAgent;
        fingerprint.fingerprint.navigator.appVersion = userAgentData.userAgent.replace(`${fingerprint.fingerprint.navigator.appCodeName}/`, '');
        fingerprint.headers['user-agent'] = userAgentData.userAgent;
        fingerprint.headers['sec-ch-ua'] = `"Microsoft Edge";v="${componentData.edge_major_version}", "Not=A?Brand";v="${componentData.not_a_brand_major_version}", "Chromium";v="${componentData.chrome_major_version}"`;
        fingerprint.headers['sec-ch-ua-full-version-list'] = `"Microsoft Edge";v="${componentData.edge_version}", "Not=A?Brand";v="${componentData.not_a_brand_version}", "Chromium";v="${componentData.chrome_version}"`;
        /*
        Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36 EdgA/129.0.0.0
        sec-ch-ua-full-version-list: "Microsoft Edge";v="129.0.2792.84", "Not=A?Brand";v="8.0.0.0", "Chromium";v="129.0.6668.90"
        sec-ch-ua: "Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"

        Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36
        "Google Chrome";v="129.0.6668.90", "Not=A?Brand";v="8.0.0.0", "Chromium";v="129.0.6668.90"
        */
        return fingerprint;
    }
    catch (error) {
        throw (0, Logger_1.log)(isMobile, 'USER-AGENT-UPDATE', 'An error occurred:' + error, 'error');
    }
}
//# sourceMappingURL=UserAgent.js.map