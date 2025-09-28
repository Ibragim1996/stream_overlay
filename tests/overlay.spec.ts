import { test, expect } from '@playwright/test';

test.describe('Overlay Smoke Tests', () => {
  test('overlay with key should load without errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate to overlay with test key
    await page.goto('/overlay?key=TEST123');

    // Wait for the overlay to load
    await page.waitForSelector('#overlay-root', { timeout: 10000 });

    // Check that the overlay is visible
    const overlay = page.locator('#overlay-root');
    await expect(overlay).toBeVisible();

    // Check that the overlay contains expected content
    await expect(overlay.locator('h3')).toContainText('🎯 AI Overlay');

    // Check that there are no console errors
    expect(consoleErrors).toHaveLength(0);

    // Check that there are no page errors
    expect(pageErrors).toHaveLength(0);

    // Take a screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/overlay-with-key.png',
      fullPage: true 
    });
  });

  test('overlay without key should show missing key message', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to overlay without key
    await page.goto('/overlay');

    // Wait for the missing key message
    await page.waitForSelector('text=Overlay key missing', { timeout: 10000 });

    // Check that the missing key message is visible
    await expect(page.locator('text=Overlay key missing')).toBeVisible();

    // Check that there are no console errors
    expect(consoleErrors).toHaveLength(0);

    // Take a screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/overlay-missing-key.png',
      fullPage: true 
    });
  });

  test('overlay should be draggable', async ({ page }) => {
    // Navigate to overlay with test key
    await page.goto('/overlay?key=TEST123');

    // Wait for the overlay to load
    await page.waitForSelector('#overlay-root', { timeout: 10000 });

    const overlay = page.locator('#overlay-root');
    
    // Get initial position
    const initialBox = await overlay.boundingBox();
    expect(initialBox).toBeTruthy();

    // Drag the overlay
    await overlay.dragTo(page.locator('body'), {
      targetPosition: { x: 100, y: 100 }
    });

    // Check that the overlay moved
    const newBox = await overlay.boundingBox();
    expect(newBox).toBeTruthy();
    expect(newBox!.x).not.toBe(initialBox!.x);
    expect(newBox!.y).not.toBe(initialBox!.y);
  });

  test('overlay panel should toggle', async ({ page }) => {
    // Navigate to overlay with test key
    await page.goto('/overlay?key=TEST123');

    // Wait for the overlay to load
    await page.waitForSelector('#overlay-root', { timeout: 10000 });

    const overlay = page.locator('#overlay-root');
    
    // Click the toggle button
    await overlay.locator('button').click();

    // Check that the panel is visible
    await expect(overlay.locator('text=Voice:')).toBeVisible();
    await expect(overlay.locator('text=Enable Voice')).toBeVisible();
    await expect(overlay.locator('text=Refresh Task')).toBeVisible();

    // Click the toggle button again
    await overlay.locator('button').click();

    // Check that the panel is hidden
    await expect(overlay.locator('text=Voice:')).not.toBeVisible();
  });

  test('health endpoint should return status ok', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.commit).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });

  test('env-check endpoint should show Firebase variables', async ({ page }) => {
    await page.goto('/env-check');

    // Wait for the page to load
    await page.waitForSelector('text=Environment Variables Check', { timeout: 10000 });

    // Check that the page shows Firebase variables
    await expect(page.locator('text=NEXT_PUBLIC_FIREBASE_API_KEY')).toBeVisible();
    await expect(page.locator('text=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')).toBeVisible();
    await expect(page.locator('text=NEXT_PUBLIC_FIREBASE_PROJECT_ID')).toBeVisible();
  });
});
