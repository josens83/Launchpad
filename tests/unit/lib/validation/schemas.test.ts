/**
 * Validation Schemas Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  uuidSchema,
  positiveIntSchema,
  paginationSchema,
  stringWithLength,
  numberRange,
} from '@/lib/validation/schemas/common';
import {
  scriptGenerationSchema,
  ScriptGenerationInput,
} from '@/lib/validation/schemas/script';
import {
  thumbnailGenerationSchema,
  ThumbnailGenerationInput,
} from '@/lib/validation/schemas/thumbnail';
import {
  loginSchema,
  signupSchema,
} from '@/lib/validation/schemas/auth';

describe('Common Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should lowercase emails', () => {
      const result = emailSchema.safeParse('Test@Example.COM');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('invalid@').success).toBe(false);
      expect(emailSchema.safeParse('@example.com').success).toBe(false);
    });
  });

  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = uuidSchema.safeParse(uuid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(uuidSchema.safeParse('').success).toBe(false);
    });
  });

  describe('positiveIntSchema', () => {
    it('should accept positive integers', () => {
      expect(positiveIntSchema.safeParse(1).success).toBe(true);
      expect(positiveIntSchema.safeParse(100).success).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(positiveIntSchema.safeParse(0).success).toBe(false);
      expect(positiveIntSchema.safeParse(-1).success).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(positiveIntSchema.safeParse(1.5).success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should have default values', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should accept valid pagination params', () => {
      const result = paginationSchema.parse({ page: 2, limit: 50 });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should coerce strings to numbers', () => {
      const result = paginationSchema.parse({ page: '3', limit: '25' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });

    it('should reject invalid values', () => {
      expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false);
      expect(paginationSchema.safeParse({ limit: 200 }).success).toBe(false);
    });
  });

  describe('stringWithLength', () => {
    it('should enforce min/max length', () => {
      const schema = stringWithLength(3, 10, 'Field');

      expect(schema.safeParse('ab').success).toBe(false);
      expect(schema.safeParse('abc').success).toBe(true);
      expect(schema.safeParse('1234567890').success).toBe(true);
      expect(schema.safeParse('12345678901').success).toBe(false);
    });

    it('should sanitize text', () => {
      const schema = stringWithLength(1, 50);
      const result = schema.parse('  hello  ');
      expect(result).toBe('hello');
    });
  });

  describe('numberRange', () => {
    it('should enforce min/max values', () => {
      const schema = numberRange(1, 100, 'Value');

      expect(schema.safeParse(0).success).toBe(false);
      expect(schema.safeParse(1).success).toBe(true);
      expect(schema.safeParse(100).success).toBe(true);
      expect(schema.safeParse(101).success).toBe(false);
    });
  });
});

describe('Script Generation Schema', () => {
  it('should accept valid input', () => {
    const input = {
      topic: 'How to learn programming',
      tone: 'educational',
      target_duration: 10,
      include_hook: true,
      include_cta: true,
      language: 'en',
    };

    const result = scriptGenerationSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: ScriptGenerationInput = result.data;
      expect(data.topic).toBe('How to learn programming');
    }
  });

  it('should require topic', () => {
    const result = scriptGenerationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject short topics', () => {
    const result = scriptGenerationSchema.safeParse({ topic: 'ab' });
    expect(result.success).toBe(false);
  });

  it('should have default values', () => {
    const result = scriptGenerationSchema.parse({ topic: 'Test topic' });

    expect(result.tone).toBe('professional');
    expect(result.target_duration).toBe(10);
    expect(result.include_hook).toBe(true);
    expect(result.include_cta).toBe(true);
    expect(result.language).toBe('en');
  });

  it('should validate target_duration range', () => {
    expect(scriptGenerationSchema.safeParse({
      topic: 'Test',
      target_duration: 0,
    }).success).toBe(false);

    expect(scriptGenerationSchema.safeParse({
      topic: 'Test',
      target_duration: 181,
    }).success).toBe(false);
  });

  it('should validate tone enum', () => {
    expect(scriptGenerationSchema.safeParse({
      topic: 'Test',
      tone: 'invalid',
    }).success).toBe(false);
  });
});

describe('Thumbnail Generation Schema', () => {
  it('should accept valid input', () => {
    const input = {
      prompt: 'A YouTube thumbnail with bold text',
      style: 'bold',
      size: '1280x720',
    };

    const result = thumbnailGenerationSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: ThumbnailGenerationInput = result.data;
      expect(data.prompt).toBe('A YouTube thumbnail with bold text');
    }
  });

  it('should require prompt', () => {
    const result = thumbnailGenerationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should have default values', () => {
    const result = thumbnailGenerationSchema.parse({
      prompt: 'Test thumbnail',
    });

    expect(result.style).toBe('bold');
    expect(result.size).toBe('1280x720');
    expect(result.text_position).toBe('center');
  });

  it('should validate style enum', () => {
    expect(thumbnailGenerationSchema.safeParse({
      prompt: 'Test',
      style: 'invalid',
    }).success).toBe(false);
  });
});

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should require email and password', () => {
      expect(loginSchema.safeParse({}).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'test@example.com' }).success).toBe(false);
      expect(loginSchema.safeParse({ password: 'password' }).success).toBe(false);
    });

    it('should have default remember_me', () => {
      const result = loginSchema.parse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.remember_me).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123',
        password_confirm: 'Password123',
        full_name: 'John Doe',
        accept_terms: true,
      });
      expect(result.success).toBe(true);
    });

    it('should require password confirmation match', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123',
        password_confirm: 'DifferentPassword',
        full_name: 'John Doe',
        accept_terms: true,
      });
      expect(result.success).toBe(false);
    });

    it('should require terms acceptance', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123',
        password_confirm: 'Password123',
        full_name: 'John Doe',
        accept_terms: false,
      });
      expect(result.success).toBe(false);
    });

    it('should validate password strength', () => {
      // No uppercase
      expect(signupSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        password_confirm: 'password123',
        full_name: 'John',
        accept_terms: true,
      }).success).toBe(false);

      // No number
      expect(signupSchema.safeParse({
        email: 'test@example.com',
        password: 'PasswordABC',
        password_confirm: 'PasswordABC',
        full_name: 'John',
        accept_terms: true,
      }).success).toBe(false);

      // Too short
      expect(signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Pass1',
        password_confirm: 'Pass1',
        full_name: 'John',
        accept_terms: true,
      }).success).toBe(false);
    });
  });
});
