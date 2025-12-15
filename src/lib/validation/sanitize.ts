/**
 * 입력 새니타이징 유틸리티
 * XSS, Injection 방어를 위한 입력 정제
 */

import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';

/**
 * HTML 태그 제거 및 텍스트 정제
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    // NULL 바이트 제거
    .replace(/\0/g, '')
    // 제어 문자 제거 (줄바꿈, 탭 제외)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 연속된 공백 정리
    .replace(/\s+/g, ' ');
}

/**
 * HTML 콘텐츠 새니타이징 (허용된 태그만)
 */
export function sanitizeHtml(input: string, options?: DOMPurifyConfig): string {
  if (typeof input !== 'string') return '';

  // 서버 사이드에서는 기본 정제만 수행
  if (typeof window === 'undefined') {
    return sanitizeText(input)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    ...options,
  });
}

/**
 * 리치 텍스트 새니타이징 (스크립트 에디터용)
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== 'string') return '';

  if (typeof window === 'undefined') {
    return sanitizeText(input);
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'div', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * URL 새니타이징
 */
export function sanitizeUrl(input: string): string | null {
  if (typeof input !== 'string') return null;

  const trimmed = input.trim();

  // 빈 문자열
  if (!trimmed) return null;

  // 위험한 프로토콜 차단
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();

  if (dangerousProtocols.some((p) => lowerUrl.startsWith(p))) {
    return null;
  }

  // URL 파싱 시도
  try {
    const url = new URL(trimmed);
    // HTTP(S)만 허용
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    // 상대 URL일 수 있음
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return null;
  }
}

/**
 * 이메일 새니타이징
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .toLowerCase()
    // 이메일에 허용된 문자만
    .replace(/[^a-z0-9@._+-]/g, '');
}

/**
 * 파일명 새니타이징
 */
export function sanitizeFilename(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    // 경로 구분자 제거
    .replace(/[/\\]/g, '')
    // 위험한 문자 제거
    .replace(/[<>:"|?*\x00-\x1F]/g, '')
    // 연속된 점 방지 (디렉토리 탐색 방지)
    .replace(/\.{2,}/g, '.')
    // 선행/후행 점/공백 제거
    .replace(/^[\s.]+|[\s.]+$/g, '')
    // 최대 길이 제한
    .slice(0, 255);
}

/**
 * JSON 문자열 새니타이징
 */
export function sanitizeJson(input: string): string {
  if (typeof input !== 'string') return '{}';

  try {
    // 파싱 후 재직렬화하여 정규화
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
}

/**
 * 숫자 ID 새니타이징
 */
export function sanitizeNumericId(input: string | number): number | null {
  const num = typeof input === 'string' ? parseInt(input, 10) : input;

  if (!Number.isFinite(num) || num < 0) {
    return null;
  }

  return Math.floor(num);
}

/**
 * UUID 새니타이징
 */
export function sanitizeUuid(input: string): string | null {
  if (typeof input !== 'string') return null;

  const trimmed = input.trim().toLowerCase();

  // UUID v4 형식 검증
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  if (!uuidRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * 검색 쿼리 새니타이징
 */
export function sanitizeSearchQuery(input: string): string {
  if (typeof input !== 'string') return '';

  return sanitizeText(input)
    // SQL 와일드카드 이스케이프
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    // 특수 검색 연산자 제거
    .replace(/[+\-*"~^$]/g, ' ')
    // 연속 공백 정리 및 trim
    .replace(/\s+/g, ' ')
    .trim()
    // 최대 길이 제한
    .slice(0, 200);
}

/**
 * 슬러그 생성 (URL-safe)
 */
export function createSlug(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .toLowerCase()
    // 공백을 하이픈으로
    .replace(/\s+/g, '-')
    // 허용된 문자만 (알파벳, 숫자, 하이픈)
    .replace(/[^a-z0-9-]/g, '')
    // 연속된 하이픈 정리
    .replace(/-+/g, '-')
    // 선행/후행 하이픈 제거
    .replace(/^-|-$/g, '')
    // 최대 길이
    .slice(0, 100);
}

/**
 * 비밀번호 새니타이징 (최소한의 정제만)
 */
export function sanitizePassword(input: string): string {
  if (typeof input !== 'string') return '';

  // 비밀번호는 대부분의 문자를 허용
  // NULL 바이트와 제어 문자만 제거
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * 신용카드 번호 마스킹
 */
export function maskCreditCard(input: string): string {
  if (typeof input !== 'string') return '';

  const digits = input.replace(/\D/g, '');

  if (digits.length < 4) return '****';

  return '**** **** **** ' + digits.slice(-4);
}

/**
 * 민감한 데이터 마스킹 (로깅용)
 */
export function maskSensitiveData(
  data: Record<string, unknown>,
  sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn']
): Record<string, unknown> {
  const masked = { ...data };

  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
      masked[key] = '[REDACTED]';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(
        masked[key] as Record<string, unknown>,
        sensitiveFields
      );
    }
  }

  return masked;
}
