import assert from 'assert';

const BASE_URL = 'http://localhost:8085';

async function runTests() {
  console.log("===============================================");
  console.log("Starting API Integration Tests...");
  console.log("===============================================");

  // Test 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200, "Health check status should be 200");
    const data = await res.json();
    assert.strictEqual(data.status, 'OK', "Health check body status should be OK");
    console.log("✓ Test 1: GET /api/health passed");
  } catch (err) {
    console.error("✗ Test 1: GET /api/health failed:", err.message);
    process.exit(1);
  }

  // Test 2: Server Validation check (missing English draft)
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journalist: "Sneha Reddy",
        english: "" // Empty English draft
      })
    });
    assert.strictEqual(res.status, 400, "Should return 400 Bad Request for validation errors");
    const data = await res.json();
    assert.ok(data.error, "Response should contain an error description");
    assert.ok(data.error.includes("English"), "Error message should mention English draft required");
    console.log("✓ Test 2: Validation error handling passed");
  } catch (err) {
    console.error("✗ Test 2: Validation check failed:", err.message);
    process.exit(1);
  }

  // Test 3: Successful Translation Generation (using Mock/Live)
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journalist: "Ramesh K.",
        inputs: "Civic cleanliness",
        english: "The Greater Hyderabad Municipal Corporation (GHMC) announced a new drive to clean up municipal parks starting next Monday.",
        tone: "Colloquial",
        dialect: "Hyderabadi"
      })
    });
    assert.strictEqual(res.status, 200, "Successful generation status should be 200");
    const data = await res.json();
    assert.strictEqual(data.success, true, "Should return success field as true");
    assert.ok(data.telugu_translation, "Should return telugu_translation field");
    assert.ok(Array.isArray(data.cultural_notes), "cultural_notes should be an array");
    assert.ok(data.response_time_ms >= 0, "Should contain response time metrics");
    console.log("✓ Test 3: POST /api/generate (clean translation) passed");
  } catch (err) {
    console.error("✗ Test 3: Generation test failed:", err.message);
    process.exit(1);
  }

  // Test 4: History list retrieval
  let testRecordId;
  try {
    const res = await fetch(`${BASE_URL}/api/history`);
    assert.strictEqual(res.status, 200, "History retrieval status should be 200");
    const history = await res.json();
    assert.ok(Array.isArray(history), "History response should be an array");
    assert.ok(history.length > 0, "History should have at least one record (from Test 3)");
    
    // Save the record ID from the generation in Test 3
    testRecordId = history[0].id;
    assert.ok(testRecordId, "History item should have a unique id field");
    console.log("✓ Test 4: GET /api/history passed");
  } catch (err) {
    console.error("✗ Test 4: GET /api/history failed:", err.message);
    process.exit(1);
  }

  // Test 5: Fetch specific history record detail by ID
  try {
    const res = await fetch(`${BASE_URL}/api/history/${testRecordId}`);
    assert.strictEqual(res.status, 200, "Fetch record detail status should be 200");
    const record = await res.json();
    assert.strictEqual(record.id, testRecordId, "Fetched record ID should match requested ID");
    assert.strictEqual(record.journalist, "Ramesh K.", "Fetched record journalist should match");
    assert.ok(record.telugu_translation, "Fetched record should contain telugu_translation");
    console.log("✓ Test 5: GET /api/history/:id passed");
  } catch (err) {
    console.error("✗ Test 5: GET /api/history/:id failed:", err.message);
    process.exit(1);
  }

  // Test 6: Fetch invalid history record detail by ID returns 404
  try {
    const res = await fetch(`${BASE_URL}/api/history/invalid-uuid-or-id`);
    assert.strictEqual(res.status, 404, "Invalid record fetch should return 404");
    console.log("✓ Test 6: GET /api/history/:id (invalid) returns 404 passed");
  } catch (err) {
    console.error("✗ Test 6: GET /api/history/:id (invalid) failed:", err.message);
    process.exit(1);
  }

  // Test 7: Submit valid feedback rating
  try {
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationId: testRecordId,
        rating: 4,
        comment: "Excellent local Hyderabadi phrasing!"
      })
    });
    assert.strictEqual(res.status, 200, "Valid feedback submission status should be 200");
    const data = await res.json();
    assert.strictEqual(data.success, true, "Feedback response success should be true");
    assert.strictEqual(data.feedback.rating, 4, "Feedback rating value should be 4");
    assert.strictEqual(data.feedback.generationId, testRecordId, "Feedback generationId should match");
    console.log("✓ Test 7: POST /api/feedback (valid) passed");
  } catch (err) {
    console.error("✗ Test 7: POST /api/feedback (valid) failed:", err.message);
    process.exit(1);
  }

  // Test 8: Submit invalid feedback rating (out of range)
  try {
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationId: testRecordId,
        rating: 6, // Invalid rating (>5)
        comment: "Too high rating"
      })
    });
    assert.strictEqual(res.status, 400, "Invalid feedback rating value should return 400");
    console.log("✓ Test 8: POST /api/feedback (invalid rating) returns 400 passed");
  } catch (err) {
    console.error("✗ Test 8: POST /api/feedback (invalid rating) failed:", err.message);
    process.exit(1);
  }

  // Test 9: Get Quality Analytics metrics
  try {
    const res = await fetch(`${BASE_URL}/api/analytics/quality`);
    assert.strictEqual(res.status, 200, "Analytics fetch status should be 200");
    const analytics = await res.json();
    assert.ok(analytics.total_generations >= 1, "Analytics should log at least 1 generation");
    assert.ok(analytics.total_feedback >= 1, "Analytics should log at least 1 feedback entry");
    assert.ok(typeof analytics.average_rating === 'number' && analytics.average_rating >= 1 && analytics.average_rating <= 5, "Analytics average rating should be a valid number between 1 and 5");
    assert.ok(Array.isArray(analytics.daily_trend), "Analytics daily trend should be an array");
    console.log("✓ Test 9: GET /api/analytics/quality passed");
  } catch (err) {
    console.error("✗ Test 9: GET /api/analytics/quality failed:", err.message);
    process.exit(1);
  }

  // Test 10: Get Detailed Admin Analytics metrics
  try {
    const res = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: { 'Authorization': 'Bearer admin123' }
    });
    assert.strictEqual(res.status, 200, "Admin Analytics fetch status should be 200");
    const adminData = await res.json();
    assert.ok(adminData.total_generations >= 1, "Admin Analytics should log generations");
    assert.ok(adminData.total_feedback >= 1, "Admin Analytics should log feedback");
    assert.ok(typeof adminData.average_rating === 'number', "Admin Analytics average rating should be a number");
    assert.ok(adminData.distributions, "Admin Analytics should contain distributions");
    assert.ok(adminData.distributions.dialects, "Admin Analytics should contain dialect distributions");
    assert.ok(adminData.distributions.tones, "Admin Analytics should contain tone distributions");
    assert.ok(Array.isArray(adminData.top_journalists), "Admin Analytics should contain top journalists array");
    assert.ok(Array.isArray(adminData.feedback_logs), "Admin Analytics should contain feedback logs array");
    console.log("✓ Test 10: GET /api/admin/analytics passed");
  } catch (err) {
    console.error("✗ Test 10: GET /api/admin/analytics failed:", err.message);
    process.exit(1);
  }

  // Test 11: Request Rate Limiter Check (Throttling after 15 requests)
  try {
    console.log("Testing request throttling (firing concurrent requests)...");
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalist: "Speedy Editor",
          english: "" // Will return 400 Bad Request, but still consumes request count
        })
      }));
    }
    
    // Wait for the first 15 requests to complete
    await Promise.all(promises);
    
    // The 16th request must return 429 Too Many Requests
    const throtRes = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journalist: "Speedy Editor",
        english: "Trigger throttling"
      })
    });
    
    assert.strictEqual(throtRes.status, 429, "The 16th request should be throttled and return HTTP 429");
    const data = await throtRes.json();
    assert.ok(data.error, "Throttled response should contain an error message");
    assert.ok(data.error.includes("Too many requests"), "Error message should mention rate limit");
    console.log("✓ Test 11: Rate Limiter throttling passed");
  } catch (err) {
    console.error("✗ Test 11: Rate Limiter throttling failed:", err.message);
    process.exit(1);
  }

  console.log("===============================================");
  console.log("All API integration tests passed successfully!");
  console.log("===============================================");
  process.exit(0);
}

// Small delay to ensure the server is fully started
setTimeout(runTests, 1000);
