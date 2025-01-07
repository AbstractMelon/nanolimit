'use strict';

class NanoRate {
  constructor(options = {}) {
    // Use bit shifting for faster default calculations
    this.windowMs = options.windowMs || (60 << 10); // ~60s
    this.maxRequests = options.maxRequests || (1 << 7); // 128
    this.errorMessage = options.errorMessage || 'Rate limit exceeded';
    this.headers = options.headers !== false;
    
    // Pre-calculate window size in seconds for header
    this.windowSeconds = this.windowMs / 1000;
    
    // Use Map for O(1) lookups and better memory management
    this.store = new Map();
    
    // Optimize garbage collection by cleaning old records periodically
    this.gcInterval = Math.min(this.windowMs, 60000);
    this.lastCleanup = Date.now();
    
    // Pre-allocate common objects to reduce GC pressure
    this._successResponse = { status: 'success' };
    this._errorResponse = { status: 'error', message: this.errorMessage };
    
    // Bind methods to avoid creating new functions
    this.check = this.check.bind(this);
    this.middleware = this.middleware.bind(this);
  }

  check(key) {
    const now = Date.now();
    
    // Cleanup if needed (amortized cost)
    if (now - this.lastCleanup > this.gcInterval) {
      this._cleanup(now);
    }

    let record = this.store.get(key);
    
    // Fast path: no existing record
      record = new Uint32Array(2);  // [count, resetTime] - more efficient than object
      record[0] = 1;  // count
      record[1] = now + this.windowMs;  // resetTime
      this.store.set(key, record);
      return { ...this._successResponse, remaining: this.maxRequests - 1, reset: this.windowMs };
    }

    // Check if window expired
    if (now >= record[1]) {
      record[0] = 1;
      record[1] = now + this.windowMs;
      return { ...this._successResponse, remaining: this.maxRequests - 1, reset: this.windowMs };
    }

    // Check if over limit
    if (record[0] >= this.maxRequests) {
      return { ...this._errorResponse, remaining: 0, reset: record[1] - now };
    }

    // Increment counter
    record[0]++;
    return {
      ...this._successResponse,
      remaining: this.maxRequests - record[0],
      reset: record[1] - now
    };
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip || req.headers['x-forwarded-for'] || 'default';
      const result = this.check(key);

      if (this.headers) {
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', this.windowSeconds);
      }

      if (result.status === 'error') {
        res.status(429).json({ error: this.errorMessage });
        return;
      }

      next();
    };
  }

  _cleanup(now) {
    for (const [key, record] of this.store) {
      if (now >= record[1]) {
        this.store.delete(key);
      }
    }
    this.lastCleanup = now;
  }

  // Helper method to get store size (useful for testing/monitoring)
  size() {
    return this.store.size;
  }
}

module.exports = NanoRate;



