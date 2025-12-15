/**
 * API Client with Retry Logic and Circuit Breaker
 * Production-grade HTTP client for reliable API communication
 */

import { AppError } from '@/lib/errors/base';
import { NetworkError, TimeoutError } from '@/lib/errors/api';

// ============== Types ==============

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number | ((attempt: number) => number);
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  circuitBreaker?: CircuitBreakerConfig;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
}

// ============== Circuit Breaker ==============

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;
  private halfOpenRequests = 0;

  constructor(private config: CircuitBreakerConfig) {}

  get isOpen(): boolean {
    if (this.state === 'OPEN') {
      // Check if we should transition to half-open
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime >= this.config.resetTimeout
      ) {
        this.state = 'HALF_OPEN';
        this.halfOpenRequests = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  get isHalfOpen(): boolean {
    return this.state === 'HALF_OPEN';
  }

  canRequest(): boolean {
    if (this.isOpen) {
      return false;
    }
    if (this.isHalfOpen && this.halfOpenRequests >= this.config.halfOpenRequests) {
      return false;
    }
    return true;
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.config.halfOpenRequests) {
        this.reset();
      }
    } else {
      this.failures = 0;
    }
  }

  recordFailure(): void {
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.trip();
    } else {
      this.failures++;
      if (this.failures >= this.config.failureThreshold) {
        this.trip();
      }
    }
  }

  private trip(): void {
    this.state = 'OPEN';
    this.failures = 0;
    this.successes = 0;
  }

  private reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.halfOpenRequests = 0;
  }

  getState(): { state: CircuitState; failures: number } {
    return {
      state: this.state,
      failures: this.failures,
    };
  }
}

// ============== Retry Logic ==============

function defaultRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
}

function defaultRetryCondition(error: Error): boolean {
  // Retry on network errors and 5xx server errors
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  if (error instanceof AppError) {
    return error.statusCode >= 500 || error.statusCode === 429;
  }
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============== Fetch with Timeout ==============

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError('fetch', timeout);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============== API Client Class ==============

export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultHeaders: Record<string, string>;
  private circuitBreaker?: CircuitBreaker;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.defaultTimeout = config.timeout || 30000;
    this.defaultRetries = config.retries || 3;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (config.circuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    }
  }

  private async executeWithRetry<T>(
    url: string,
    options: RequestConfig
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = defaultRetryDelay,
      retryCondition = defaultRetryCondition,
      onRetry,
      ...fetchOptions
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        // Check circuit breaker
        if (this.circuitBreaker && !this.circuitBreaker.canRequest()) {
          throw new AppError('Service temporarily unavailable', {
            code: 'CIRCUIT_OPEN',
            statusCode: 503,
            retryable: true,
            retryAfter: 30,
          });
        }

        if (this.circuitBreaker?.isHalfOpen) {
          // Track half-open request
        }

        const response = await fetchWithTimeout(url, fetchOptions, timeout);

        // Handle response
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new AppError(errorBody.message || `HTTP ${response.status}`, {
            code: `HTTP_${response.status}`,
            statusCode: response.status,
            retryable: response.status >= 500 || response.status === 429,
            context: { endpoint: url, metadata: { status: response.status } },
          });
        }

        // Record success
        this.circuitBreaker?.recordSuccess();

        // Parse response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return response.json();
        }
        return response.text() as unknown as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Record failure for circuit breaker
        this.circuitBreaker?.recordFailure();

        // Check if we should retry
        const shouldRetry =
          attempt <= retries && retryCondition(lastError, attempt);

        if (shouldRetry) {
          const delay =
            typeof retryDelay === 'function'
              ? retryDelay(attempt)
              : retryDelay;

          onRetry?.(lastError, attempt);

          await sleep(delay);
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  private buildURL(path: string, params?: Record<string, string>): string {
    const url = new URL(path.startsWith('http') ? path : `${this.baseURL}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }
    return url.toString();
  }

  async get<T>(
    path: string,
    options?: RequestConfig & { params?: Record<string, string> }
  ): Promise<T> {
    const { params, ...config } = options || {};
    return this.executeWithRetry<T>(this.buildURL(path, params), {
      ...config,
      method: 'GET',
      headers: { ...this.defaultHeaders, ...config?.headers },
    });
  }

  async post<T>(path: string, data?: unknown, options?: RequestConfig): Promise<T> {
    return this.executeWithRetry<T>(this.buildURL(path), {
      ...options,
      method: 'POST',
      headers: { ...this.defaultHeaders, ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(path: string, data?: unknown, options?: RequestConfig): Promise<T> {
    return this.executeWithRetry<T>(this.buildURL(path), {
      ...options,
      method: 'PUT',
      headers: { ...this.defaultHeaders, ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(path: string, data?: unknown, options?: RequestConfig): Promise<T> {
    return this.executeWithRetry<T>(this.buildURL(path), {
      ...options,
      method: 'PATCH',
      headers: { ...this.defaultHeaders, ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestConfig): Promise<T> {
    return this.executeWithRetry<T>(this.buildURL(path), {
      ...options,
      method: 'DELETE',
      headers: { ...this.defaultHeaders, ...options?.headers },
    });
  }

  getCircuitBreakerState(): { state: CircuitState; failures: number } | null {
    return this.circuitBreaker?.getState() || null;
  }
}

// ============== Default Client Instance ==============

export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
  retries: 3,
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenRequests: 3,
  },
});

// ============== Convenience Functions ==============

export async function fetchWithRetry<T>(
  url: string,
  options?: RequestConfig
): Promise<T> {
  return apiClient.get<T>(url, options);
}

export default apiClient;
