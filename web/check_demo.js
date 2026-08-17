const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:5173/demo', { waitUntil: 'networkidle2' });
  
  const content = await page.content();
  console.log('CONTENT START');
  console.log(content.substring(0, 1000));
  
  await browser.close();
})();
