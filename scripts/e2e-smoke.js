const fs = require('fs');
const { chromium } = require('playwright-core');

function findBrowserExecutable() {
  const candidates = [
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
    'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

async function main() {
  const exe = findBrowserExecutable();
  if (!exe) {
    console.error('No Chrome/Edge executable found on this machine.');
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: exe,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // Ignore expected errors in headless test environment:
    // - Missing favicon/asset
    // - Custom-scheme deep links not supported on this machine
    if (/Failed to load resource: the server responded with a status of 404/i.test(text)) return;
    if (/scheme does not have a registered handler/i.test(text)) return;
    if (text.includes("Failed to launch '") && text.includes('://')) return;
    errors.push(`console.error: ${text}`);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Loading state should appear
  await page.waitForSelector('text=Fetching latest fares', { timeout: 10000 });

  // Wait for fares to load (mock delay 1.5s)
  await page.waitForTimeout(2200);

  // Cards should render with at least one BOOK button
  await page.waitForSelector('text=BOOK ON', { timeout: 10000 });

  // Check quick sort pills exist and click through
  await page.click('text=Fastest');
  await page.waitForTimeout(300);
  await page.click('text=Best Rated');
  await page.waitForTimeout(300);
  await page.click('text=Cheapest');
  await page.waitForTimeout(300);

  // Vehicle filter buttons should exist
  // Use exact, visible filter pills (avoid matching the vehicle dropdown on the dev toolbar)
  await page.getByRole('button', { name: /filter by auto/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /filter by all/i }).click();
  await page.waitForTimeout(300);

  // Sort direction toggle
  await page.click('text=Direction');
  // The toggle button is right after "Direction" label in the UI
  // so just click the nearest button in that section
  const dirButtons = await page.locator('button', { hasText: 'Asc' }).count();
  if (dirButtons > 0) {
    await page.locator('button', { hasText: 'Asc' }).first().click();
  } else {
    await page.locator('button', { hasText: 'Desc' }).first().click();
  }
  await page.waitForTimeout(300);

  // Booking overlay + toast
  await page.click('text=BOOK ON OLA');
  await page.waitForSelector('text=Opening app…', { timeout: 5000 });
  await page.waitForTimeout(2200); // allow deep-link attempt + toast render
  await page.waitForSelector('text=opened with your details', { timeout: 8000 });

  // Escape should close overlay (if still visible)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Basic assertion: no console/page errors
  await browser.close();

  if (errors.length) {
    console.error('Found browser errors:\\n' + errors.join('\\n'));
    process.exit(1);
  }

  console.log('E2E smoke test passed: loading, sort/filter, booking overlay, toast.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

