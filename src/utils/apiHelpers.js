import axios from 'axios';
import { config } from '../config/env';
import { AppError } from './errorHandler';

//Rate Limiter Class
//Prevents exceeding API rate limit
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }
//Wait if rate limit would be exceeded
  async waitIfNeeded() {
    const now = Date.now();
    
    // Remove old requests outside time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      
      console.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Clean up again after waiting
      this.requests = this.requests.filter(time => Date.now() - time < this.timeWindow);
    }

    this.requests.push(Date.now());
  }

  //Get remaining requests
  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.maxRequests - this.requests.length;
  }

  //Reset limiter
  reset() {
    this.requests = [];
  }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} - Result of function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.response) {
        const status = error.response.status;
        // Don't retry on client errors (except 429)
        if (status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate backoff delay (exponential)
      const backoffDelay = delay * Math.pow(2, attempt);
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${backoffDelay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw new AppError(
    `Failed after ${maxRetries} retries: ${lastError.message}`,
    lastError.response?.status || 500,
    'RETRY_FAILED'
  );
};

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Axios options
 * @param {number} timeout - Timeout in ms
 * @returns {Promise} - Axios response
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await axios({
      url,
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new AppError('Request timeout', 408, 'TIMEOUT');
    }
    throw error;
  }
};

//Create rate limiters for different APIs
export const cryptoLimiter = new RateLimiter(
  config.apiRateLimitRequests,
  config.apiRateLimitWindow
);

export const weatherLimiter = new RateLimiter(
  config.apiRateLimitRequests,
  config.apiRateLimitWindow
);

/**
 * Fetch with retry and rate limiting
 * @param {string} url - URL to fetch
 * @param {Object} options - Axios options
 * @param {RateLimiter} limiter - Rate limiter instance
 * @param {number} maxRetries - Max retry attempts
 * @returns {Promise} - Axios response
 */
export const fetchWithRetryAndLimit = async (
  url,
  options = {},
  limiter = null,
  maxRetries = 3
) => {
  // Apply rate limiting if provided
  if (limiter) {
    await limiter.waitIfNeeded();
  }

  // Fetch with retry
  return await retryWithBackoff(
    () => fetchWithTimeout(url, options),
    maxRetries
  );
};

/**
 * Batch requests to avoid overwhelming API
 * @param {Array} requests - Array of request functions
 * @param {number} batchSize - Number of concurrent requests
 * @param {RateLimiter} limiter - Rate limiter
 * @returns {Promise<Array>} - Array of results
 */
export const batchRequests = async (requests, batchSize = 5, limiter = null) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (requestFn) => {
        if (limiter) {
          await limiter.waitIfNeeded();
        }
        return await requestFn();
      })
    );
    
    results.push(...batchResults);
  }
  
  return results;
};

 
//Create axios instance with interceptors
export const createApiInstance = (baseURL, options = {}) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    ...options
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      if (config.params) {
        config.params._t = Date.now();
      } else {
        config.params = { _t: Date.now() };
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Log errors in development
      if (config.isDevelopment) {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message
        });
      }
      return Promise.reject(error);
    }
  );

  return instance;
};