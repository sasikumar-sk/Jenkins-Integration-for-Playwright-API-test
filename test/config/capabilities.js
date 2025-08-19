module.exports = {
  chromeWin: {
    browserName: 'Chrome',
    browserVersion: 'latest',
    'LT:Options': {
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      platform: 'Windows 10',
      build: 'Playwright101Build',
      name: 'Win10-Chrome',
      network: true,
      video: true,
      console: true,
    }
  }
  // Uncomment only if Firefox support is confirmed by LambdaTest
  /*
  firefoxMac: {
    browserName: 'Firefox',
    browserVersion: 'latest',
    'LT:Options': {
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      platform: 'macOS Catalina',
      build: 'Playwright101Build',
      name: 'MacOS-Firefox',
      network: true,
      video: true,
      console: true,
    }
  }
  */
};
