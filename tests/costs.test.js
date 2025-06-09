import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import costsRouter from '../routes/costs.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/add', costsRouter);
app.use('/api/report', costsRouter);

describe('POST /api/add', () => {
    test('should return 400 for missing required fields', async () => {
        const response = await request(app)
            .post('/api/add')
            .send({
                description: 'Test cost'
                // Missing category, userid, sum
            })
            .expect(400);

        assert.ok(response.body.error);
        assert.ok(response.body.error.includes('Missing required fields'));
    });

    test('should return 400 for invalid data types', async () => {
        const response = await request(app)
            .post('/api/add')
            .send({
                description: 'Test cost',
                category: 'food',
                userid: 'abc', // Should be number
                sum: 'xyz'     // Should be number
            })
            .expect(400);

        assert.ok(response.body.error);
        assert.ok(response.body.error.includes('Invalid number values for userid or sum'));
    });

    test('should return 400 for negative sum', async () => {
        const response = await request(app)
            .post('/api/add')
            .send({
                description: 'Test cost',
                category: 'food',
                userid: 123,
                sum: -50 // Negative
            })
            .expect(400);

        assert.ok(response.body.error);
        assert.ok(response.body.error.includes('Sum must be a positive number (Greater than 0)'));
    });
});

describe('GET /api/report', () => {
    test('should return 400 for missing parameters', async () => {
        const response = await request(app)
            .get('/api/report?id=123&year=2025') // Missing month
            .expect(400);

        assert.ok(response.body.error);
        assert.ok(response.body.error.includes('Missing required query parameters'));
    });

    test('should return 400 for invalid month range', async () => {
        const response = await request(app)
            .get('/api/report?id=123&year=2025&month=13') // Invalid month
            .expect(400);

        assert.ok(response.body.error);
        assert.ok(response.body.error.includes('Month must be between 1 and 12'));
    });

    test('should return 400 for invalid data types', async () => {
        const response = await request(app)
            .get('/api/report?id=abc&year=2025&month=5') // Invalid id
            .expect(400);

        assert.ok(response.body.error);
        assert.ok(response.body.error.includes('Invalid number values for id, year or month'));
    });
})