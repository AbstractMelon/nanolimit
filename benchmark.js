"use strict";

const NanoRate = require("./index.js");

function runBenchmark() {
  console.log("Running nanorate benchmarks...\n");

  const configs = [
    { name: "Default config", options: {} },
    { name: "Short window", options: { windowMs: 1000, maxRequests: 10 } },
    {
      name: "Large window",
      options: { windowMs: 3600000, maxRequests: 10000 },
    },
  ];

  for (const config of configs) {
    console.log(`\n${config.name}:`);
    const limiter = new NanoRate(config.options);

    // Warm up
    for (let i = 0; i < 1000; i++) {
      limiter.check("test-key");
    }

    // Single key test
    console.log("\nSingle key performance:");
    const singleStart = process.hrtime.bigint();
    for (let i = 0; i < 100000; i++) {
      limiter.check("test-key");
    }
    const singleEnd = process.hrtime.bigint();
    const singleOps = (100000n * 1000000000n) / (singleEnd - singleStart);
    console.log(`Operations per second: ${singleOps}`);

    // Multiple keys test
    console.log("\nMultiple keys performance:");
    const multiStart = process.hrtime.bigint();
    for (let i = 0; i < 100000; i++) {
      limiter.check("test-key-" + i);
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
