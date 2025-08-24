"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlReward = void 0;
const Workers_1 = require("../Workers");
class UrlReward extends Workers_1.Workers {
    async doUrlReward(page) {
        this.bot.log(this.bot.isMobile, 'URL-REWARD', 'Trying to complete UrlReward');
        try {
            this.bot.utils.wait(2000);
            await page.close();
            this.bot.log(this.bot.isMobile, 'URL-REWARD', 'Completed the UrlReward successfully');
        }
        catch (error) {
            await page.close();
            this.bot.log(this.bot.isMobile, 'URL-REWARD', 'An error occurred:' + error, 'error');
        }
    }
}
exports.UrlReward = UrlReward;
//# sourceMappingURL=UrlReward.js.map