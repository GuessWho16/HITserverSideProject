import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import aboutRouter from '../routes/about.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/about', aboutRouter);

describe('GET /api/about', () => {
    test('should return team information', async () => {
        const response = await request(app)
            .get('/api/about')
            .expect(200);

        assert.strictEqual(Array.isArray(response.body), true);
        assert.strictEqual(response.body.length, 2);
        assert.strictEqual(response.body[0].first_name, 'Noy');
        assert.strictEqual(response.body[0].last_name, 'Klar');
        assert.strictEqual(response.body[1].first_name, 'Daniel');
        assert.strictEqual(response.body[1].last_name, 'Podolsky');
    });
});