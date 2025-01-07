# Nanorate

Ultra-fast, zero-dependency rate limiting for Node.js.

## Features

- Zero dependencies
- Extremely high performance (>1M

ops/sec)

- Minimal memory footprint
- Efficient garbage collection
- Express middleware support
- Customizable windows and limits
- Rate limit headers

## Installation

```bash
npm install nanorate
```

## Usage

### Basic Usage

```javascript
const NanoRate = require("nanorate");

const limiter = new NanoRate({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // limit each key to 100 requests per window
  errorMessage: "Too many requests",
  headers: true, // Send rate limit headers
});

// Check rate limit
const result = limiter.check("user-123");
if (result.status === "error") {
  console.log("Rate limit exceeded");
}
```

### Express Middleware

```javascript
const express = require("express");
const NanoRate = require("nanorate");

const app = express();

app.use(
  new NanoRate({
    windowMs: 900000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per window
  }).middleware()
);
```

## Performance

Run the benchmark:

```bash
node benchmark.js
```

Typical results:

- Single key: ~2M ops/sec
- Multiple keys: ~1.5M ops/sec
- Memory usage: <1MB for 10k active keys

## Configuration

| Option       | Type    | Default               | Description                 |
| ------------ | ------- | --------------------- | --------------------------- |
| windowMs     | number  | 61440                 | Time window in milliseconds |
| maxRequests  | number  | 128                   | Max requests per window     |
| errorMessage | string  | 'Rate limit exceeded' | Error message               |
| headers      | boolean | true                  | Enable rate limit headers   |

## License

MIT
