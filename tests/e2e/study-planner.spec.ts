import { test, expect } from '@playwright/test';

test.describe('StudyAI Planner Pro E2E Flow', () => {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: `C:/Users/admin/.gemini/antigravity-ide/brain/28d494ae-006d-4615-8b97-4c019d34e101/screenshot-failure.png`, fullPage: true });
    }
  });

  test('should allow a user to open landing, enter app, configure and generate a study plan, and complete a task', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    
    // 1. Open Landing Page
    await page.goto('/');
    
    // Check that landing page title renders
    await expect(page.locator('h1')).toContainText('Study smarter');

    // 2. Click "Get Started" to go to register
    await page.click('text=Get Started');
    await page.waitForURL('**/register');

    // 3. Register a test user
    const email = `test-${Date.now()}@studyai.pro`;
    await page.fill('#reg-email', email);
    await page.fill('#reg-pass', 'password123');
    await page.fill('#reg-confirm', 'password123');
    await page.click('button[type="submit"]');

    // 4. Complete the onboarding wizard
    await page.waitForURL('**/onboarding');

    // Step 1: Subjects
    await page.fill('#subject-input-1', 'Chemistry');
    await page.click('button:has(svg.lucide-plus)');
    await expect(page.locator('main.flex-grow')).toContainText('Chemistry');
    await page.click('button:has-text("Continue")');

    // Step 2: Syllabus
    await expect(page.locator('h1')).toContainText('Upload Course Syllabus');
    await page.setInputFiles('input[type="file"]', {
      name: 'chemistry_syllabus.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Unit 1: Core Subjects\nChapter 1: Basic Topics\nTopics: molecular orbitals, crystal fields.')
    });
    await expect(page.getByText('Uploaded', { exact: true })).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Step 3: Exam Details
    await expect(page.locator('h1')).toContainText('Enter Exam Milestones');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    await page.click('button:has-text("Continue")');

    // Step 4: Availability
    await expect(page.locator('h1')).toContainText('Daily Study Availability');
    const hoursSlider = page.locator('#daily-hours-slider-2');
    await hoursSlider.fill('6');
    await page.click('button:has-text("Build AI Study Plan")');

    // 5. Verify redirect to Dashboard and navigate to AI Planner
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Aditya');

    // Click on AI Planner in the sidebar to view generated study tasks
    await page.click('text=AI Planner');
    await page.waitForURL('**/planner');
    await expect(page.locator('h1')).toContainText('AI Personalized Planner');

    // Verify task visibility on Day 1
    const firstTask = page.locator('text=Study topic:').first();
    await expect(firstTask).toBeVisible();

    // Toggle the first task as complete
    const taskRow = page.locator('.shadow-sm', { hasText: 'Study topic:' }).first();
    const checkbox = taskRow.locator('button');
    await expect(checkbox).toBeVisible();
    
    // Check initial progress text
    const progressText = page.locator('text=topics').first();
    await expect(progressText).toContainText('0/');
    
    // Complete the task
    await checkbox.click();

    // Check completion progress updates to 1/X topics
    await expect(progressText).toContainText('1/');
  });
});
