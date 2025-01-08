"use strict";

const NanoRate = require("../src/index.js");
const rateLimit = require("express-rate-limit");
const { RateLimiterMemory } = require("rate-limiter-flexible");

// Configure rate limiters
const expressRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  keyGenerator: (req) => req.headers["x-forwarded-for"] || req.ip || "default", // Custom key generator
});

const flexLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per minute
});

function runBenchmark() {
  console.log("Running rate limiter benchmarks...\n");

  const configs = [
    {
      name: "NanoRate (Default config)",
      limiter: new NanoRate({}),
      options: {},
    },
    {
      name: "NanoRate (Short window)",
      limiter: new NanoRate({ windowMs: 1000, maxRequests: 10 }),
      options: { windowMs: 1000, maxRequests: 10 },
    },
    {
      name: "NanoRate (Large window)",
      limiter: new NanoRate({ windowMs: 3600000, maxRequests: 10000 }),
      options: { windowMs: 3600000, maxRequests: 10000 },
    },
    { name: "express-rate-limit", limiter: expressRateLimit, options: {} },
    { name: "rate-limiter-flexible", limiter: flexLimiter, options: {} },
  ];

  // Run benchmark for each limiter
  for (const config of configs) {
    console.log(`\nRunning benchmark for ${config.name}:`);

    // Warm up
    if (config.limiter instanceof NanoRate) {
      for (let i = 0; i < 1000; i++) {
        config.limiter.check("test-key");
      }
    }

    // Single key test
    console.log("\nSingle key performance:");
    const singleStart = process.hrtime.bigint();
    for (let i = 0; i < 100000; i++) {
      if (config.limiter instanceof NanoRate) {
        config.limiter.check("test-key");
      } else if (config.limiter === expressRateLimit) {
        expressRateLimit(
          { headers: { "x-forwarded-for": "test-ip" } },
          {},
          () => {}
        ); // Simulate a request
      } else if (config.limiter === flexLimiter) {
        flexLimiter.consume("test-key");
      }
    }
    const singleEnd = process.hrtime.bigint();
    const singleOps = (100000n * 1000000000n) / (singleEnd - singleStart);
    console.log(`Operations per second: ${singleOps}`);

    // Multiple keys test
    console.log("\nMultiple keys performance:");
    const multiStart = process.hrtime.bigint();
    for (let i = 0; i < 100000; i++) {
      const key = "test-key-" + i;
      if (config.limiter instanceof NanoRate) {
        config.limiter.check(key);
      } else if (config.limiter === expressRateLimit) {
        expressRateLimit(
          { headers: { "x-forwarded-for": "test-ip" } },
          {},
          () => {}
        ); // Simulate a request
      } else if (config.limiter === flexLimiter) {
        flexLimiter.consume(key);
      }
    }
    const multiEnd = process.hrtime.bigint();
    const multiOps = (100000n * 1000000000n) / (multiEnd - multiStart);
    console.log(`Operations per second: ${multiOps}`);

    // Memory usage
    const used = process.memoryUsage();
    console.log("\nMemory usage:");
    for (let key in used) {
      console.log(
        `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
      );
    }
    console.log("----------------------------------------\n");
  }
}

runBenchmark();
