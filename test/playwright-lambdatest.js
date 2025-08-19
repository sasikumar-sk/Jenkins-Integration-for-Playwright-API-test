// playwright-lambdatest.js
require('dotenv').config({ path: '../.env' }); // If .env is in parent dir


const { chromium, firefox } = require('playwright');
const capabilities = require('./config/capabilities.js'); // adjust path if needed

(async () => {
  const browsers = [
    { type: chromium, caps: capabilities.chromeWin },
    { type: firefox, caps: capabilities.firefoxMac }
  ];

  await Promise.all(
    browsers.map(async ({ type, caps }) => {
      const browser = await type.connect({
        wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(caps))}`
      });

      // --- Example: Simple Form Demo ---
      const page = await browser.newPage();
      await page.goto('https://www.lambdatest.com/selenium-playground');
      await page.click('text=Simple Form Demo');
      // ... continue as per your full test scenarios ...
      await browser.close();
    })
  );
})();
