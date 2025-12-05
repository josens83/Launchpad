/**
 * Base Error Class Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  wrapError,
  isAppError,
  hasErrorCode,
} from '@/lib/errors/base';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an error with default options', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.category).toBe('internal');
      expect(error.severity).toBe('medium');
      expect(error.isOperational).toBe(true);
      expect(error.retryable).toBe(false);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create an error with custom options', () => {
      const error = new AppError('Custom error', {
        code: 'CUSTOM_ERROR',
        statusCode: 400,
        category: 'validation',
        severity: 'low',
        isOperational: false,
        retryable: true,
        retryAfter: 30,
      });

      expect(error.code).toBe('CUSTOM_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.category).toBe('validation');
      expect(error.severity).toBe('low');
      expect(error.isOperational).toBe(false);
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(30);
    });

    it('should include context information', () => {
      const error = new AppError('Test error', {
        context: {
          userId: 'user123',
          requestId: 'req456',
        },
      });

      expect(error.context.userId).toBe('user123');
      expect(error.context.requestId).toBe('req456');
      expect(error.context.timestamp).toBeDefined();
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new AppError('Test error', {
        code: 'TEST_ERROR',
        statusCode: 400,
      });

      const json = error.toJSON();

      expect(json.name).toBe('AppError');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(400);
    });
  });

  describe('toClientSafe', () => {
    it('should return client-safe error info', () => {
      const error = new AppError('Internal details', {
        code: 'SOME_ERROR',
        statusCode: 500,
        retryable: true,
        retryAfter: 10,
      });

      const clientSafe = error.toClientSafe();

      expect(clientSafe.code).toBe('SOME_ERROR');
      expect(clientSafe.statusCode).toBe(500);
      expect(clientSafe.retryable).toBe(true);
      expect(clientSafe.retryAfter).toBe(10);
    });
  });

  describe('canRetry', () => {
    it('should return true for retryable errors', () => {
      const error = new AppError('Test', {
        retryable: true,
        retryAfter: 5,
      });

      expect(error.canRetry()).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const error = new AppError('Test', {
        retryable: false,
      });

      expect(error.canRetry()).toBe(false);
    });
  });

  describe('hasCode', () => {
    it('should check if error has specific code', () => {
      const error = new AppError('Test', { code: 'SPECIFIC_CODE' });

      expect(error.hasCode('SPECIFIC_CODE')).toBe(true);
      expect(error.hasCode('OTHER_CODE')).toBe(false);
    });
  });

  describe('toLogString', () => {
    it('should generate log-friendly string', () => {
      const error = new AppError('Test error', {
        code: 'TEST_CODE',
        severity: 'high',
        context: {
          userId: 'user123',
          requestId: 'req456',
        },
      });

      const logString = error.toLogString();

      expect(logString).toContain('[HIGH]');
      expect(logString).toContain('[TEST_CODE]');
      expect(logString).toContain('Test error');
      expect(logString).toContain('user123');
      expect(logString).toContain('req456');
    });
  });
});

describe('wrapError', () => {
  it('should return AppError as-is', () => {
    const original = new AppError('Test', { code: 'ORIGINAL' });
    const wrapped = wrapError(original);

    expect(wrapped).toBe(original);
  });

  it('should wrap standard Error', () => {
    const original = new Error('Standard error');
    const wrapped = wrapError(original);

    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.message).toBe('Standard error');
    expect(wrapped.code).toBe('WRAPPED_ERROR');
    expect(wrapped.cause).toBe(original);
  });

  it('should wrap string', () => {
    const wrapped = wrapError('String error');

    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.message).toBe('String error');
  });

  it('should wrap unknown types', () => {
    const wrapped = wrapError({ foo: 'bar' });

    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.code).toBe('UNKNOWN_ERROR');
  });

  it('should merge context when wrapping AppError', () => {
    const original = new AppError('Test', {
      context: { userId: 'user1' },
    });
    const wrapped = wrapError(original, { requestId: 'req1' });

    expect(wrapped.context.userId).toBe('user1');
    expect(wrapped.context.requestId).toBe('req1');
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    expect(isAppError(new AppError('Test'))).toBe(true);
  });

  it('should return false for other types', () => {
    expect(isAppError(new Error('Test'))).toBe(false);
    expect(isAppError('string')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe('hasErrorCode', () => {
  it('should check error code correctly', () => {
    const error = new AppError('Test', { code: 'SPECIFIC' });

    expect(hasErrorCode(error, 'SPECIFIC')).toBe(true);
    expect(hasErrorCode(error, 'OTHER')).toBe(false);
    expect(hasErrorCode(new Error('Test'), 'ANY')).toBe(false);
  });
});
