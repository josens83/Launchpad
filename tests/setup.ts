/**
 * Vitest 테스트 설정 파일
 */

import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Mock 환경 변수
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key');
vi.stubEnv('OPENAI_API_KEY', 'test-openai-key');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private callback: IntersectionObserverCallback) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock fetch (기본)
global.fetch = vi.fn();

// 테스트 전/후 정리
beforeAll(() => {
  // 테스트 전 설정
});

afterEach(() => {
  // 각 테스트 후 정리
  vi.clearAllMocks();
});

afterAll(() => {
  // 모든 테스트 후 정리
  vi.unstubAllEnvs();
});

// 콘솔 에러 억제 (선택적)
const originalConsoleError = console.error;
console.error = (...args) => {
  // React 관련 경고 무시
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') ||
     args[0].includes('ReactDOM.render is no longer supported'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
