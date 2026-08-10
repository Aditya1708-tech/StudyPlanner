import { test, expect } from '@playwright/test';

test.describe('StudyAI Planner Pro E2E Flow', () => {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: `C:/Users/admin/.gemini/antigravity-ide/brain/a8976c58-b775-4178-8c17-cc620a36babe/screenshot-failure.png`, fullPage: true });
    }
  });

  test('should allow a user to open landing, enter app, configure and generate a study plan, and complete a task', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    
    // 1. Open Landing Page
    await page.goto('/');
    
    // Check that landing page title renders
    await expect(page.locator('h1')).toContainText('Study smarter');

    // 2. Click CTA to enter App / Dashboard
    await page.click('text=Try Demo');
    
    // Wait for Dashboard to render
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Aditya');

    // 3. Navigate to AI Planner
    await page.click('text=AI Planner');
    await page.waitForURL('/planner');
    await expect(page.locator('h1')).toContainText('AI Personalized Planner');

    // 4. Fill in new subject information
    const subjectName = 'Literature Study E2E';
    await page.fill('#subject-input', subjectName);
    
    // Select date 5 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.fill('#exam-date-input', dateString);
    
    // Click "Add Subject"
    await page.click('text=Add Subject');
    
    // Verify subject list displays our newly added course
    await expect(page.locator('main')).toContainText(subjectName);

    // 5. Adjust available daily study hours slider
    const hoursSlider = page.locator('#daily-hours-slider');
    await hoursSlider.fill('6');

    // 6. Generate the plan
    await page.click('text=Generate Study Plan');

    // 7. Verify plan schedule days and tracker render
    await expect(page.locator('text=Plan Progress Tracker')).toBeVisible();
    await expect(page.locator('text=Literature Study E2E').first()).toBeVisible();

    // 8. Complete a generated task
    const firstCheckbox = page.locator('button[aria-label^="Toggle completion of"]').first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.click();

    // Check that progress tracking indicates completion
    await expect(page.locator('text=tasks completed')).toContainText('1 of');
  });
});
