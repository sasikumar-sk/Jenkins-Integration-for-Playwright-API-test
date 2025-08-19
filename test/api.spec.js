const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');


test.describe('CERN Catalogue API - Advanced Tests', () => {

  test.describe.configure({ mode: 'parallel' });

const ajv = new Ajv();
  const apiUrl = 'https://catalogue.library.cern/api/literature/?q=html&sort=bestmatch&page=1&size=15';
  const outputDir = './api_responses';

  test.beforeAll(async () => {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
  });

  test('1. Network spy: capture all XHR/fetch and parse JSON safely', async ({ page }) => {
    const capturedResponses = [];

    // Listen for all network responses
    page.on('response', async (response) => {
      const url = response.url();
      const resourceType = response.request().resourceType();

      if (resourceType === 'xhr' || resourceType === 'fetch') {
        try {
          const json = await response.json(); // safe parse
          capturedResponses.push({ url, status: response.status(), json });
          //console.log(`Captured XHR/fetch: ${url}`);
        } catch (e) {
          //console.log(`Non-JSON or failed parse from: ${url}`);
        }
      }
    });

    await page.goto('https://catalogue.library.cern/');   
    await page.waitForTimeout(3000);
    // Save captured responses to file
    const filePath = path.join(outputDir, 'network_spy_responses.json');
    await fs.writeFile(filePath, JSON.stringify(capturedResponses, null, 2));

    //console.log(`Captured responses saved to ${filePath}`);
    expect(capturedResponses.length).toBeGreaterThan(0);
  });

  test('2. Mocking API response with custom payload', async ({ page }) => {
    await page.route('https://catalogue.library.cern/api/literature/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'mocked response',
          hits: [{ id: 'mock1', title: 'Mocked paper' }],
          total: 1
        }),
      });
    });

    const response = await page.goto(apiUrl);
    expect(response.status()).toBe(200);
    const jsonResponse = await response.json();
    //console.log('Mocked JSON Response:', JSON.stringify(jsonResponse, null, 2));
    expect(jsonResponse.total).toBe(1);

    // Save mocked response to file
    const filePath = path.join(outputDir, 'mocked_response.json');
    await fs.writeFile(filePath, JSON.stringify(jsonResponse, null, 2));
  });

  test('3.Direct API test using Playwright request fixture', async ({ request }) => {
    const apiResponse = await request.get(apiUrl);
    expect(apiResponse.ok()).toBeTruthy();

    const json = await apiResponse.json();
    //console.log('Direct API Response:', JSON.stringify(json, null, 2));
    expect(json).toHaveProperty('hits');

    // Save direct API response to file
    const filePath = path.join(outputDir, 'direct_api_response.json');
    await fs.writeFile(filePath, JSON.stringify(json, null, 2));
  });
  test('4. Validate response headers', async ({ request }) => {
    const response = await request.get(apiUrl);
    expect(response.ok()).toBeTruthy(); 
    // Check Content-Type
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
 
  });

  test('5. Intercept and modify API response', async ({ page }) => {
    await page.route('https://catalogue.library.cern/api/literature/**', async (route) => {
      const original = await route.fetch();
      const json = await original.json(); 
      json.hits.hits.unshift({ id: 'injected', title: 'Injected Paper' });

      await route.fulfill({
        response: original,
        body: JSON.stringify(json),
      });
    });

    const response = await page.goto(apiUrl);
    expect(response.status()).toBe(200);
    const jsonResponse = await response.json();
    expect(jsonResponse.hits.hits.some(item => item.id === 'injected')).toBeTruthy();
    const filePath = path.join(outputDir, 'intercept_modified.json');
    await fs.writeFile(filePath, JSON.stringify(jsonResponse, null, 2));
  });

  test('6. Simulate API failure (500)', async ({ page }) => {
    await page.route('https://catalogue.library.cern/api/literature/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    const response = await page.goto(apiUrl);
    expect(response.status()).toBe(500);
    const jsonResponse = await response.json();
    expect(jsonResponse.error).toBe('Internal Server Error'); 
  });

  test('7. Query parameter variations', async ({ request }) => {
    const queries = [
      { q: 'python', sort: 'bestmatch', page: 1, size: 5 },
      { q: 'json', sort: 'date', page: 2, size: 10 },
    ];

    for (const params of queries) {
      const url = `https://catalogue.library.cern/api/literature/?q=${params.q}&sort=${params.sort}&page=${params.page}&size=${params.size}`;
      const response = await request.get(url);
      expect(response.ok()).toBeTruthy();
      const json = await response.json(); 
      expect(json.hits.hits.length).toBeLessThanOrEqual(params.size);
      const filePath = path.join(outputDir, `response_${params.q}_${params.size}.json`);
      await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    }
  });

  test('8. Response time validation (latency)', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(apiUrl);
    const end = Date.now();
    const duration = end - start;
    //console.log(`Response time: ${duration} ms`);
    expect(duration).toBeLessThan(2000);
    const json = await response.json();
    //const filePath = path.join(outputDir, 'latency_test.json');
    //await fs.writeFile(filePath, JSON.stringify({ duration, json }, null, 2));
  });

});