const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://chatgpt.com/share/694be57b-39f8-8011-b035-5f1c5f2cd1dd', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Wait for content to load
  await page.waitForTimeout(3000);
  
  // Get all message content
  const messages = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-message-author-role]');
    const results = [];
    elements.forEach(el => {
      const role = el.getAttribute('data-message-author-role');
      const text = el.innerText;
      results.push({ role, text });
    });
    return results;
  });
  
  // Also try getting markdown content
  const content = await page.evaluate(() => {
    // Try various selectors for ChatGPT conversation content
    const selectors = [
      '.markdown',
      '[class*="prose"]',
      '[data-testid*="conversation"]',
      '.text-base',
      'article'
    ];
    
    let allText = [];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.innerText && el.innerText.length > 50) {
          allText.push(el.innerText);
        }
      });
    });
    return [...new Set(allText)].join('\n\n---\n\n');
  });
  
  console.log('=== MESSAGES ===');
  console.log(JSON.stringify(messages, null, 2));
  console.log('\n=== CONTENT ===');
  console.log(content);
  
  await browser.close();
})();
