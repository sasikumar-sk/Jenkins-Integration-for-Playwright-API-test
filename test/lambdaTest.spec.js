import { test, expect } from '@playwright/test';

// Scenario 1
test('Simple Form Demo - Validate Message', async ({ page }) => {
  await page.goto('https://www.lambdatest.com/selenium-playground');

  await page.click('text=Simple Form Demo');
  await expect(page).toHaveURL(/.*simple-form-demo/);

  const message = "Welcome to LambdaTest";
  await page.fill('#user-message', message);
  await page.click('#showInput');

  const output = await page.locator('#message').textContent();
  expect(output).toBe(message);
});

// Scenario 2
test('Drag & Drop Slider - Move to 95', async ({ page }) => {
  await page.goto('https://www.lambdatest.com/selenium-playground');
  await page.click('text=Drag & Drop Sliders');

  const slider = page.locator("input[type='range'][value='15']");
  const output = page.locator('#rangeSuccess');

  await slider.fill('95');
  await expect(output).toHaveText('95');
});

// Scenario 3
test('Input Form Submit - Validate Error and Success', async ({ page }) => {
  await page.goto('https://www.lambdatest.com/selenium-playground');
  await page.click('text=Input Form Submit');

  await page.click('button:has-text("Submit")');

  // Assert validation error
  await expect(page.locator('.parsley-required').first()).toHaveText('Please fill out this field.');

  // Fill form
  await page.fill('input[name="name"]', 'Sasi Kumar');
  await page.fill('input[name="email"]', 'sasi@test.com');
  await page.fill('input[name="password"]', 'Test@123');
  await page.fill('input[name="company"]', 'LambdaTest');
  await page.fill('input[name="website"]', 'https://example.com');
  await page.selectOption('select[name="country"]', { label: 'United States' });
  await page.fill('input[name="city"]', 'Chennai');
  await page.fill('input[name="address1"]', '123 Main St');
  await page.fill('input[name="address2"]', 'Apt 456');
  await page.fill('input[name="state"]', 'Tamil Nadu');
  await page.fill('input[name="zip"]', '600001');

  await page.click('button:has-text("Submit")');

  // Assert success
  await expect(page.locator('.success-msg')).toHaveText(
    'Thanks for contacting us, we will get back to you shortly.'
  );
});
