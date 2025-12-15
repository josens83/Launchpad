/**
 * Sanitization Utilities Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeFilename,
  sanitizeNumericId,
  sanitizeUuid,
  sanitizeSearchQuery,
  createSlug,
  maskSensitiveData,
} from '@/lib/validation/sanitize';

describe('sanitizeText', () => {
  it('should trim whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('should remove NULL bytes', () => {
    expect(sanitizeText('hello\x00world')).toBe('helloworld');
  });

  it('should normalize multiple spaces', () => {
    expect(sanitizeText('hello   world')).toBe('hello world');
  });

  it('should remove control characters except newlines and tabs', () => {
    expect(sanitizeText('hello\x0Bworld')).toBe('helloworld');
    expect(sanitizeText('hello\nworld')).toContain('hello');
  });

  it('should handle non-string input', () => {
    expect(sanitizeText(null as unknown as string)).toBe('');
    expect(sanitizeText(undefined as unknown as string)).toBe('');
    expect(sanitizeText(123 as unknown as string)).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('should accept valid HTTPS URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('should accept valid HTTP URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('should reject javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
  });

  it('should reject data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('should accept relative URLs starting with /', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
  });

  it('should reject protocol-relative URLs', () => {
    expect(sanitizeUrl('//evil.com')).toBeNull();
  });

  it('should handle invalid URLs', () => {
    expect(sanitizeUrl('not-a-url')).toBeNull();
  });

  it('should trim whitespace', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com/');
  });
});

describe('sanitizeEmail', () => {
  it('should lowercase email', () => {
    expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
  });

  it('should remove invalid characters', () => {
    // Only < and > are removed, "script" is valid email characters
    expect(sanitizeEmail('test<script>@example.com')).toBe('testscript@example.com');
    expect(sanitizeEmail('test!@example.com')).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
  });

  it('should allow valid email characters', () => {
    expect(sanitizeEmail('test+tag@example.com')).toBe('test+tag@example.com');
    expect(sanitizeEmail('test.name@example.com')).toBe('test.name@example.com');
  });
});

describe('sanitizeFilename', () => {
  it('should remove path separators', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
    expect(sanitizeFilename('folder/file.txt')).toBe('folderfile.txt');
  });

  it('should remove dangerous characters', () => {
    expect(sanitizeFilename('file<script>.txt')).toBe('filescript.txt');
    expect(sanitizeFilename('file:name.txt')).toBe('filename.txt');
  });

  it('should prevent directory traversal', () => {
    expect(sanitizeFilename('...')).toBe('');
  });

  it('should remove leading/trailing dots and spaces', () => {
    expect(sanitizeFilename('.hidden')).toBe('hidden');
    expect(sanitizeFilename('file. ')).toBe('file');
  });

  it('should limit length', () => {
    const longName = 'a'.repeat(300);
    expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
  });
});

describe('sanitizeNumericId', () => {
  it('should return valid positive integers', () => {
    expect(sanitizeNumericId(123)).toBe(123);
    expect(sanitizeNumericId('456')).toBe(456);
  });

  it('should reject negative numbers', () => {
    expect(sanitizeNumericId(-1)).toBeNull();
    expect(sanitizeNumericId('-5')).toBeNull();
  });

  it('should floor floating point numbers', () => {
    expect(sanitizeNumericId(12.7)).toBe(12);
  });

  it('should reject invalid inputs', () => {
    expect(sanitizeNumericId('abc')).toBeNull();
    expect(sanitizeNumericId(NaN)).toBeNull();
    expect(sanitizeNumericId(Infinity)).toBeNull();
  });
});

describe('sanitizeUuid', () => {
  it('should accept valid UUIDs', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(sanitizeUuid(uuid)).toBe(uuid);
  });

  it('should lowercase UUIDs', () => {
    const uuid = '550E8400-E29B-41D4-A716-446655440000';
    expect(sanitizeUuid(uuid)).toBe(uuid.toLowerCase());
  });

  it('should reject invalid UUIDs', () => {
    expect(sanitizeUuid('not-a-uuid')).toBeNull();
    expect(sanitizeUuid('550e8400-e29b-11d4-a716-446655440000')).toBeNull(); // v1 not v4
    expect(sanitizeUuid('550e8400-e29b-41d4-c716-446655440000')).toBeNull(); // wrong variant
  });

  it('should trim whitespace', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(sanitizeUuid(`  ${uuid}  `)).toBe(uuid);
  });
});

describe('sanitizeSearchQuery', () => {
  it('should escape SQL wildcards', () => {
    expect(sanitizeSearchQuery('test%query')).toBe('test\\%query');
    expect(sanitizeSearchQuery('test_query')).toBe('test\\_query');
  });

  it('should remove special operators', () => {
    expect(sanitizeSearchQuery('"exact phrase"')).toBe('exact phrase');
    expect(sanitizeSearchQuery('term1 +term2')).toBe('term1 term2');
  });

  it('should limit length', () => {
    const longQuery = 'a'.repeat(300);
    expect(sanitizeSearchQuery(longQuery).length).toBeLessThanOrEqual(200);
  });

  it('should sanitize text as well', () => {
    expect(sanitizeSearchQuery('  search  term  ')).toBe('search term');
  });
});

describe('createSlug', () => {
  it('should create URL-safe slugs', () => {
    expect(createSlug('Hello World')).toBe('hello-world');
    expect(createSlug('Test Article Title')).toBe('test-article-title');
  });

  it('should remove special characters', () => {
    expect(createSlug('Hello! World?')).toBe('hello-world');
    expect(createSlug('Test & Article')).toBe('test-article');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(createSlug('Hello   World')).toBe('hello-world');
    expect(createSlug('Hello---World')).toBe('hello-world');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(createSlug('-Hello World-')).toBe('hello-world');
  });

  it('should limit length', () => {
    const longTitle = 'a'.repeat(150);
    expect(createSlug(longTitle).length).toBeLessThanOrEqual(100);
  });
});

describe('maskSensitiveData', () => {
  it('should mask sensitive fields', () => {
    const data = {
      username: 'john',
      password: 'secret123',
      email: 'john@example.com',
    };

    const masked = maskSensitiveData(data);

    expect(masked.username).toBe('john');
    expect(masked.password).toBe('[REDACTED]');
    expect(masked.email).toBe('john@example.com');
  });

  it('should mask nested sensitive fields', () => {
    const data = {
      user: {
        name: 'john',
        apiKey: 'key123',
      },
    };

    const masked = maskSensitiveData(data);

    expect((masked.user as Record<string, unknown>).name).toBe('john');
    expect((masked.user as Record<string, unknown>).apiKey).toBe('[REDACTED]');
  });

  it('should use custom sensitive fields', () => {
    const data = {
      customSecret: 'secret',
      normalField: 'normal',
    };

    const masked = maskSensitiveData(data, ['customSecret']);

    expect(masked.customSecret).toBe('[REDACTED]');
    expect(masked.normalField).toBe('normal');
  });
});
