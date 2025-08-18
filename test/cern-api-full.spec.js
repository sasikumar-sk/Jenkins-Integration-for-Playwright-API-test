const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');
const fs = require('fs').promises;
const path = require('path');

const ajv = new Ajv();
const outputDir = './api_responses';

// Updated schema to reflect nested hits structure
const responseSchema = {
  type: 'object',
  properties: {
    hits: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        hits: { type: 'array' }
      },
      required: ['total', 'hits']
    }
  },
  required: ['hits'],
  additionalProperties: true
};

const queryParams = [
  { q: 'html', sort: 'bestmatch', page: 1, size: 10 },
  { q: 'json', sort: 'date', page: 2, size: 5 },
  { q: 'python', sort: 'relevance', page: 3, size: 15 },
];

test.describe.parallel('CERN Catalogue API Full Suite', () => {

  test.beforeAll(async () => {
    await fs.mkdir(outputDir, { recursive: true });
  });

  for (const params of queryParams) {
    test(`API param test: q=${params.q}, sort=${params.sort}, page=${params.page}, size=${params.size}`, async ({ request }) => {
      const url = `https://catalogue.library.cern/api/literature/?q=${params.q}&sort=${params.sort}&page=${params.page}&size=${params.size}`;
      const response = await request.get(url);

      expect(response.ok()).toBeTruthy();

      const json = await response.json();

      console.log('API JSON:', JSON.stringify(json, null, 2)); // Debug output for response structure

      // Schema validation
      const valid = ajv.validate(responseSchema, json);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errors);
      }
      expect(valid).toBe(true);

      // Save response to file
      const fileName = `response_${params.q}_${params.sort}_page${params.page}_size${params.size}_${Date.now()}.json`;
      const filePath = path.join(outputDir, fileName);
      await fs.writeFile(filePath, JSON.stringify(json, null, 2));
      console.log(`Saved API response to ${filePath}`);

      // Basic content assertions
      expect(json).toHaveProperty('hits');
      expect(json.hits).toHaveProperty('total');
      expect(Array.isArray(json.hits.hits)).toBeTruthy();
    });
  }

});
