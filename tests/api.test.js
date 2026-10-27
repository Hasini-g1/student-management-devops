const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// Set test environment and separate test data file BEFORE loading app
const TEST_DATA_PATH = path.join(__dirname, '../data/students.test.json');
process.env.NODE_ENV = 'test';
process.env.DATA_FILE_PATH = TEST_DATA_PATH;

const request = require('supertest');
const app = require('../src/app');

// Seed test dataset
const INITIAL_TEST_STUDENTS = [
  {
    id: 'std_test_001',
    rollNumber: 'CS2026-101',
    name: 'Alice Johnson',
    email: 'alice.johnson@college.edu',
    department: 'Computer Science',
    year: '3rd Year',
    gpa: 9.2,
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'std_test_002',
    rollNumber: 'IT2026-102',
    name: 'Bob Smith',
    email: 'bob.smith@college.edu',
    department: 'Information Technology',
    year: '2nd Year',
    gpa: 8.4,
    status: 'Active',
    createdAt: new Date().toISOString()
  }
];

describe('DevOps Student Management API Test Suite', () => {
  before(async () => {
    // Ensure test data file directory exists
    const dir = path.dirname(TEST_DATA_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(TEST_DATA_PATH, JSON.stringify(INITIAL_TEST_STUDENTS, null, 2), 'utf8');
  });

  beforeEach(async () => {
    // Reset test data before each test for test isolation
    await fs.promises.writeFile(TEST_DATA_PATH, JSON.stringify(INITIAL_TEST_STUDENTS, null, 2), 'utf8');
  });

  after(async () => {
    // Clean up test file after test run
    if (fs.existsSync(TEST_DATA_PATH)) {
      try {
        await fs.promises.unlink(TEST_DATA_PATH);
      } catch (err) {
        // ignore cleanup error
      }
    }
  });

  // Test 1: Health check endpoint
  it('1. GET /health should return status 200 and report UP status', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
    assert.ok(typeof res.body.uptime === 'number');
    assert.ok(res.body.timestamp);
    assert.equal(res.body.version, '1.0.0');
  });

  // Test 2: Listing all students
  it('2. GET /api/students should return status 200 and list student records', async () => {
    const res = await request(app).get('/api/students');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.count, 2);
    assert.equal(res.body.data[0].rollNumber, 'CS2026-101');
    assert.equal(res.body.data[0].name, 'Alice Johnson');
  });

  // Test 3: Creating a new student successfully
  it('3. POST /api/students should create a new student and return 201', async () => {
    const newStudentData = {
      name: 'Charlie Brown',
      rollNumber: 'EC2026-103',
      email: 'charlie.brown@college.edu',
      department: 'Electronics & Communication',
      year: '1st Year',
      gpa: 8.75,
      status: 'Active'
    };

    const res = await request(app)
      .post('/api/students')
      .send(newStudentData);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.name, 'Charlie Brown');
    assert.equal(res.body.data.rollNumber, 'EC2026-103');
    assert.equal(res.body.data.email, 'charlie.brown@college.edu');
    assert.equal(res.body.data.gpa, 8.75);

    // Verify persisted record in GET /api/students
    const listRes = await request(app).get('/api/students');
    assert.equal(listRes.body.count, 3);
  });

  // Test 4: Rejecting invalid input (Missing fields and invalid email)
  it('4. POST /api/students should reject invalid input with status 400', async () => {
    // Case 4a: Missing name
    const invalidNoName = {
      rollNumber: 'CS2026-999',
      email: 'test@college.edu',
      department: 'Computer Science',
      year: '1st Year',
      gpa: 8.0
    };
    const res1 = await request(app)
      .post('/api/students')
      .send(invalidNoName);
    assert.equal(res1.status, 400);
    assert.equal(res1.body.success, false);
    assert.ok(res1.body.error);

    // Case 4b: Invalid email format
    const invalidEmail = {
      name: 'Bad Email Student',
      rollNumber: 'CS2026-998',
      email: 'not-an-email',
      department: 'Computer Science',
      year: '1st Year',
      gpa: 7.5
    };
    const res2 = await request(app)
      .post('/api/students')
      .send(invalidEmail);
    assert.equal(res2.status, 400);
    assert.equal(res2.body.success, false);

    // Case 4c: Duplicate roll number
    const duplicateRoll = {
      name: 'Duplicate Roll Student',
      rollNumber: 'CS2026-101', // Already exists in test seed
      email: 'unique.email@college.edu',
      department: 'Computer Science',
      year: '2nd Year',
      gpa: 7.5
    };
    const res3 = await request(app)
      .post('/api/students')
      .send(duplicateRoll);
    assert.equal(res3.status, 400);
    assert.equal(res3.body.success, false);
    assert.ok(res3.body.error.includes('already exists'));
  });

  // Test 5: Fetch student by ID & handle not found
  it('5. GET /api/students/:id should return 200 for valid ID and 404 for invalid ID', async () => {
    // Valid ID
    const res = await request(app).get('/api/students/std_test_001');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Alice Johnson');

    // Invalid ID
    const notFoundRes = await request(app).get('/api/students/non_existent_999');
    assert.equal(notFoundRes.status, 404);
    assert.equal(notFoundRes.body.success, false);
  });

  // Test 6: Update an existing student record (PUT)
  it('6. PUT /api/students/:id should update student record with status 200', async () => {
    const updatePayload = {
      name: 'Alice J. Johnson',
      gpa: 9.5,
      year: '4th Year'
    };

    const res = await request(app)
      .put('/api/students/std_test_001')
      .send(updatePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Alice J. Johnson');
    assert.equal(res.body.data.gpa, 9.5);
    assert.equal(res.body.data.year, '4th Year');
    assert.equal(res.body.data.rollNumber, 'CS2026-101'); // Unchanged
  });

  // Test 7: Delete a student record (DELETE)
  it('7. DELETE /api/students/:id should remove student and return status 200', async () => {
    const deleteRes = await request(app).delete('/api/students/std_test_002');
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.body.success, true);
    assert.equal(deleteRes.body.data.id, 'std_test_002');

    // Verify it is no longer retrievable
    const getRes = await request(app).get('/api/students/std_test_002');
    assert.equal(getRes.status, 404);

    // Verify total count decreased
    const listRes = await request(app).get('/api/students');
    assert.equal(listRes.body.count, 1);
  });
});
