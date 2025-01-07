'use strict';

const NanoRate = require('./index.js');
const assert = require('assert');

function runTests() {
  console.log('Running tests...\n');

  // Test 1: Basic rate limiting
  {
    console.log('Test 1: Basic rate limiting');
    const limiter = new NanoRate({ maxRequests: 2 });
    
    const result1 = limiter.check('test-key');
    const result2 = limiter.check('test-key');
    const result3 = limiter.check('test-key');
    
    assert(result1.status === 'success', 'First request should succeed');
    assert(result2.status === 'success', 'Second request should succeed');
    assert(result3.status === 'error', 'Third request should fail');
    console.log('✓ Passed\n');
  }

  // Test 2: Window expiration
  {
    console.log('Test 2: Window expiration');
    const limiter = new NanoRate({ windowMs: 100, maxRequests: 1 });
    
    const result1 = limiter.check('test-key');
    const result2 = limiter.check('test-key');
    assert(result1.status === 'success', 'First request should succeed');
    assert(result2.status === 'error', 'Second request should fail');
    
    setTimeout(() => {
      const result3 = limiter.check('test-key');
      assert(result3.status === 'success', 'Request after window expires should succeed');
      console.log('✓ Passed\n');
    }, 100);
  }

  // Test 3: Multiple keys
  {
    console.log('Test 3: Multiple keys');
    const limiter = new NanoRate({ maxRequests: 1 });
    
    const result1 = limiter.check('key1');
    const result2 = limiter.check('key2');
    assert(result1.status === 'success', 'First key should succeed');
    assert(result2.status === 'success', 'Second key should succeed');
    console.log('✓ Passed\n');
  }

  // Test 4: Memory cleanup
  {
    console.log('Test 4: Memory cleanup');
    const limiter = new NanoRate({ windowMs: 100, maxRequests: 1 });
    
    for (let i = 0; i < 1000; i++) {
      limiter.check();
    }
    
    setTimeout(() => {
      limiter._cleanup(Date.now());
      assert(limiter.size() === 0, 'Store should be empty after cleanup');
      console.log('✓ Passed\n');
    }, 100);
  }
}

runTests();
