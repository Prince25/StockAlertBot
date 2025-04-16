import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'util';

// Logger for consistent formatting
const logTag = (tag) => format('[%s]', tag);
const log = {
  info: (tag, message, ...args) => console.log('%s %s', logTag(tag), format(message, ...args)),
  warn: (tag, message, ...args) => console.warn('%s %s', logTag(tag), format(message, ...args)),
  error: (tag, message, ...args) => console.error('%s %s', logTag(tag), format(message, ...args))
};

// Ensure logs directory exists
async function ensureLogDirectory() {
  const logsDir = path.join(process.cwd(), 'logs', 'bypass-attempts');
  try {
    await fs.mkdir(logsDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  return logsDir;
}

// Save HTML content to a file
async function saveHtml(content, prefix) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logsDir = await ensureLogDirectory();
    const filePath = path.join(logsDir, `${prefix}-${timestamp}.html`);
    await fs.writeFile(filePath, content);
    return filePath;
  } catch (err) {
    log.error('SAVE', 'Failed to save HTML: %s', err.message);
    return null;
  }
}

// Save screenshot
async function saveScreenshot(page, prefix) {
  try {
    const timestamp = Math.floor(Date.now());
    const logsDir = await ensureLogDirectory();
    const filePath = path.join(logsDir, `${prefix}-screen-${timestamp}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  } catch (err) {
    log.error('SCREEN', 'Failed to save screenshot: %s', err.message);
    return null;
  }
}

// Random delay to mimic human behavior
async function randomDelay(min = 500, max = 2000) {
  const delay = Math.floor(Math.random() * (max - min)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

// Use Playwright to fetch Costco product page
async function fetchCostcoWithPlaywright(url, headless = true) {
  log.info('INIT', 'Launching Playwright browser (Chromium) with headless=%s', headless);
  
  // Launch browser with specific options to avoid detection
  const browser = await chromium.launch({
    headless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    ],
    channel: 'chrome', // Uses the installed Chrome browser instead of bundled Chromium
    ignoreDefaultArgs: ['--enable-automation']
  });

  // Create context with specific options
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    bypassCSP: true,
    javaScriptEnabled: true,
    ignoreHTTPSErrors: true,
    geolocation: { longitude: -122.4, latitude: 37.7 }, // San Francisco
    permissions: ['geolocation'],
    locale: 'en-US',
    timezoneId: 'America/New_York',
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false
  });
  
  // Modify WebDriver-related properties to avoid detection
  await context.addInitScript(() => {
    // Overwrite the navigator.webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
      configurable: true
    });
    
    // Remove navigator.automation property
    if (navigator.hasOwnProperty('automation')) {
      delete navigator.automation;
    }
    
    // Add fake plugins to make the browser appear more realistic
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        return {
          length: 5,
          item: () => ({ name: 'Chrome PDF Plugin' }),
          namedItem: () => ({ name: 'Chrome PDF Plugin' }),
          refresh: () => {},
          [Symbol.iterator]: function* () {
            yield { name: 'Chrome PDF Plugin' };
            yield { name: 'Chrome PDF Viewer' };
            yield { name: 'Native Client' };
            yield { name: 'Chrome Web Store' };
            yield { name: 'Google Docs Offline' };
          }
        };
      }
    });
    
    // Add a fake language list
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en', 'es'],
      configurable: true
    });
    
    // Remove automation-specific function properties
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
    
    // Handle client-side exception issues
    window.addEventListener('error', function(e) {
      if (e.message && (e.message.includes('client-side exception') || e.message.includes('Application error'))) {
        console.log('Detected client-side exception, attempting recovery...');
        setTimeout(() => {
          location.reload(true);
        }, 1000);
      }
    });
  });

  const page = await context.newPage();
  let htmlPath = null;
  let productInfo = null;

  try {
    // Page-level event listeners
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        log.info('BROWSER', `${type}: ${msg.text()}`);
      }
    });

    // First navigate to the costco homepage
    log.info('NAVIGATE', 'Loading Costco homepage');
    await page.goto('https://www.costco.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Save homepage data
    await saveHtml(await page.content(), 'costco-homepage-playwright');
    await saveScreenshot(page, 'costco-homepage-playwright');
    
    // Simulate human behavior with delays and scrolling
    await randomDelay(2000, 3000);
    
    // Perform natural mouse movements
    await page.mouse.move(500, 200, { steps: 5 });
    await randomDelay(300, 700);
    await page.mouse.move(800, 350, { steps: 5 });
    
    // Scroll down like a human
    await page.evaluate(() => {
      window.scrollBy({
        top: 300,
        behavior: 'smooth'
      });
    });
    
    await randomDelay(1500, 2500);
    
    // Navigate to the electronics section first (more natural user flow)
    log.info('NAVIGATE', 'Browsing to electronics section');
    await page.goto('https://www.costco.com/electronics.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // More human-like behavior
    await randomDelay(1800, 3000);
    
    // Scroll and move mouse more
    await page.mouse.move(600, 300, { steps: 5 });
    await randomDelay(200, 500);
    
    await page.evaluate(() => {
      window.scrollBy({
        top: 400,
        behavior: 'smooth'
      });
    });
    
    await randomDelay(1000, 2000);
    
    // Finally navigate to the product page
    log.info('NAVIGATE', 'Loading product page: %s', url);
    
    // First click a link (more human-like)
    try {
      await page.evaluate(() => {
        // Create a history entry to make it seem like we clicked on something
        history.pushState({}, '', '/audio.html');
      });
      await randomDelay(800, 1500);
    } catch (e) {
      // Ignore if this fails
    }
    
    // Now go to the actual product URL
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 40000
    });
    
    log.info('STATUS', 'Product page response status: %s', response.status());
    
    // Save initial product page data
    await saveHtml(await page.content(), 'costco-product-initial-playwright');
    await saveScreenshot(page, 'costco-product-initial-playwright');
    
    // Check for client-side application error
    const hasErrorMessage = await page.evaluate(() => {
      const bodyText = document.body.innerText || '';
      return bodyText.includes('Application error') || 
             bodyText.includes('client-side exception');
    });
    
    if (hasErrorMessage) {
      log.warn('ERROR', 'Detected client-side application error, will try to reload');
      
      // Try a simple reload with a backoff strategy
      await randomDelay(2000, 3000);
      await page.reload({ waitUntil: 'networkidle' });
      
      await saveHtml(await page.content(), 'costco-after-reload-playwright');
      await saveScreenshot(page, 'costco-after-reload-playwright');
      
      // Check if error is still present
      const stillHasError = await page.evaluate(() => {
        const bodyText = document.body.innerText || '';
        return bodyText.includes('Application error') || 
               bodyText.includes('client-side exception');
      });
      
      if (stillHasError) {
        log.warn('ERROR', 'Error persists after reload, trying an alternative approach');
        
        // Clear storage and cookies for a fresh start
        await context.clearCookies();
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        
        // Try loading the product directly with cache disabled
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        await saveHtml(await page.content(), 'costco-direct-approach-playwright');
        await saveScreenshot(page, 'costco-direct-approach-playwright');
      }
    }
    
    // Add a small delay before extraction
    await randomDelay(1000, 2000);
    
    // Extract product information
    try {
      log.info('EXTRACT', 'Attempting to extract product information');
      
      // Wait for selectors with a generous timeout
      await Promise.race([
        page.waitForSelector('.product-h1-container-v2', { timeout: 8000 }).catch(() => null),
        page.waitForSelector('.product-h1-container', { timeout: 8000 }).catch(() => null),
        page.waitForSelector('h1', { timeout: 8000 }).catch(() => null),
        page.waitForSelector('.value', { timeout: 8000 }).catch(() => null),
        page.waitForSelector('#add-to-cart-btn', { timeout: 8000 }).catch(() => null)
      ]);
      
      productInfo = await page.evaluate(() => {
        const titleElement = document.querySelector('.product-h1-container-v2') || 
                            document.querySelector('.product-h1-container') || 
                            document.querySelector('h1');
        const priceElement = document.querySelector('.value') || 
                            document.querySelector('.product-price');
        const addToCartBtn = document.querySelector('#add-to-cart-btn') || 
                            document.querySelector('.add-to-cart');
        const imageElement = document.querySelector('.product-img-responsive') ||
                            document.querySelector('.img-responsive');
        const descriptionElement = document.querySelector('#product-details') ||
                                  document.querySelector('.product-info-description');
        
        return {
          title: titleElement ? titleElement.innerText.trim() : document.title,
          price: priceElement ? priceElement.innerText.trim() : null,
          isAvailable: addToCartBtn ? !addToCartBtn.disabled : false,
          imageUrl: imageElement ? imageElement.src : null,
          description: descriptionElement ? descriptionElement.innerText.trim() : null
        };
      });
      
      log.info('SUCCESS', 'Successfully extracted product info: %s', 
        productInfo && productInfo.title ? productInfo.title : 'Unknown product');
    } catch (extractError) {
      log.warn('EXTRACT', 'Failed to extract product info: %s', extractError.message);
    }
    
    // Get final content
    const html = await page.content();
    htmlPath = await saveHtml(html, productInfo ? 'costco-product-success-playwright' : 'costco-product-fail-playwright');
    await saveScreenshot(page, 'costco-product-final-playwright');
    
    if (headless) {
      log.info('DONE', 'Completed fetching, closing browser');
      await browser.close();
    } else {
      log.info('DONE', 'Completed fetching, browser will stay open');
      // Keep browser open in non-headless mode for manual inspection
    }
    
    return { 
      status: 'ok', 
      html, 
      htmlPath, 
      productInfo,
      responseStatus: response.status() 
    };
  } catch (error) {
    log.error('ERROR', 'Error occurred: %s', error.message);
    
    try {
      htmlPath = await saveHtml(await page.content(), 'costco-error-playwright');
      await saveScreenshot(page, 'costco-error-playwright');
    } catch (saveError) {
      log.error('ERROR', 'Failed to save error page: %s', saveError.message);
    }
    
    if (headless) {
      await browser.close();
    }
    
    return { status: 'error', error, htmlPath };
  }
}

// If this file is run directly, test the function
if (process.argv[1].endsWith('costco-bypass-playwright.js')) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  // Extract flags
  const useHeadless = !args.includes('--visible');
  const useSimpleUrl = args.includes('--simple');
  
  // Remove flags to get the URL if specified
  const urlArgs = args.filter(arg => !arg.startsWith('--'));
  const testUrl = urlArgs.length > 0 ? 
    urlArgs[0] : 
    'https://www.costco.com/jbl-live-675nc-wireless-true-adaptive-noise-cancelling-on-ear-headphones.product.4000280025.html';
  
  const finalUrl = useSimpleUrl ? 
    'https://www.costco.com/televisions.html' : 
    testUrl;
  
  console.log(`Testing Costco bypass with URL: ${finalUrl}`);
  console.log(`Mode: ${useHeadless ? 'Headless' : 'Visible browser'}`);
  console.log('Press Ctrl+C to abort if the script hangs...');
  
  // Ensure script doesn't run indefinitely
  const timeoutId = setTimeout(() => {
    console.error('Script execution timed out after 120 seconds!');
    process.exit(1);
  }, 120000);
  
  fetchCostcoWithPlaywright(finalUrl, useHeadless)
    .then(result => {
      clearTimeout(timeoutId);
      
      if (result.status === 'ok') {
        console.log('Success! Got product HTML content');
        console.log(`HTML content length: ${result.html.length} bytes`);
        console.log(`Response status: ${result.responseStatus}`);
        console.log(`Saved to: ${result.htmlPath}`);
        
        if (result.productInfo) {
          console.log('\nProduct Information:');
          console.log(`- Title: ${result.productInfo.title || 'Unknown'}`);
          console.log(`- Price: ${result.productInfo.price || 'Not available'}`);
          console.log(`- Available: ${result.productInfo.isAvailable ? 'Yes' : 'No'}`);
          if (result.productInfo.description) {
            console.log(`- Description: ${result.productInfo.description.substring(0, 100)}...`);
          }
        }
      } else {
        console.error('Error:', result.error.message);
        if (result.htmlPath) {
          console.log(`Error page HTML saved to: ${result.htmlPath}`);
        }
      }
      
      // Exit if in headless mode (browser already closed)
      if (useHeadless) {
        process.exit(result.status === 'ok' ? 0 : 1);
      }
    })
    .catch(err => {
      clearTimeout(timeoutId);
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

export { fetchCostcoWithPlaywright };