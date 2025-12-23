// src/tests/api.test.ts
import chai from 'chai';
import supertest from 'supertest';
import { app } from '../server';  // 現在可以成功 import 了！

const expect = chai.expect;
const request = supertest(app);

describe('API Routes Tests (TDD)', () => {
    let testLabelId: number;

    it('should create a new label (POST /api/labels)', async () => {
        const res = await request
            .post('/api/labels')
            .send({ name: 'test_label' });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body.name).to.equal('test_label');
        testLabelId = res.body.id;
    });

    it('should get list of labels (GET /api/labels)', async () => {
        const res = await request.get('/api/labels');

        expect(res.status).to.equal(200);
        expect(res.body.labels).to.be.an('array');
        expect(res.body.labels.length).to.be.at.least(1);
        const found = res.body.labels.find((l: any) => l.name === 'test_label');
        expect(found).to.exist;
    });

    it('should get image list (GET /api/images)', async () => {
        const res = await request.get('/api/images');

        expect(res.status).to.equal(200);
        expect(res.body.images).to.be.an('array');
    });

    // 可選：測試刪除 label（如果你實作了 DELETE route）
    // it('should delete the test label', async () => {
    //     const res = await request.delete(`/api/labels/${testLabelId}`);
    //     expect(res.status).to.equal(200);
    // });
});