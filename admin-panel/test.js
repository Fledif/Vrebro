import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  
  // Test Admin Panel
  console.log('Testing Admin Panel on http://localhost:5176/');
  const page1 = await browser.newPage();
  page1.on('console', msg => console.log('ADMIN CONSOLE:', msg.text()));
  page1.on('pageerror', err => console.log('ADMIN PAGE ERROR:', err.toString()));
  await page1.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });
  
  // Test Miniapp
  console.log('Testing Miniapp on http://localhost:5177/miniapp/');
  const page2 = await browser.newPage();
  page2.on('console', msg => console.log('MINIAPP CONSOLE:', msg.text()));
  page2.on('pageerror', err => console.log('MINIAPP PAGE ERROR:', err.toString()));
  // miniapp is served at / because we're running vite directly, not through main.py
  await page2.goto('http://localhost:5177/miniapp/', { waitUntil: 'networkidle2' });
  
  await browser.close();
})();
