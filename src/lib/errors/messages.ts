/**
 * 사용자 친화적 에러 메시지
 * 다국어 지원 및 에러 복구 가이드
 */

export type SupportedLocale = 'en' | 'ko' | 'ja' | 'es' | 'pt';

export type ErrorAction = 'retry' | 'refresh' | 'login' | 'upgrade' | 'contact' | 'wait' | 'fix_input' | 'none';

export interface ErrorMessage {
  title: string;
  description: string;
  action?: ErrorAction;
  actionLabel?: string;
  helpUrl?: string;
}

export interface LocalizedErrorMessage {
  en: ErrorMessage;
  ko: ErrorMessage;
  ja?: ErrorMessage;
  es?: ErrorMessage;
  pt?: ErrorMessage;
}

/**
 * 에러 코드별 메시지 맵
 */
export const ERROR_MESSAGES: Record<string, LocalizedErrorMessage> = {
  // 네트워크 에러
  NETWORK_ERROR: {
    en: {
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    ko: {
      title: '연결 오류',
      description: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
      action: 'retry',
      actionLabel: '다시 시도',
    },
  },

  TIMEOUT: {
    en: {
      title: 'Request Timeout',
      description: 'The request took too long to complete. Please try again.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    ko: {
      title: '요청 시간 초과',
      description: '요청 처리에 시간이 너무 오래 걸렸습니다. 다시 시도해주세요.',
      action: 'retry',
      actionLabel: '다시 시도',
    },
  },

  // 인증 에러
  INVALID_CREDENTIALS: {
    en: {
      title: 'Invalid Credentials',
      description: 'The email or password you entered is incorrect.',
      action: 'fix_input',
      actionLabel: 'Try Again',
    },
    ko: {
      title: '로그인 실패',
      description: '이메일 또는 비밀번호가 올바르지 않습니다.',
      action: 'fix_input',
      actionLabel: '다시 시도',
    },
  },

  TOKEN_EXPIRED: {
    en: {
      title: 'Session Expired',
      description: 'Your session has expired. Please sign in again.',
      action: 'login',
      actionLabel: 'Sign In',
    },
    ko: {
      title: '세션 만료',
      description: '세션이 만료되었습니다. 다시 로그인해주세요.',
      action: 'login',
      actionLabel: '로그인',
    },
  },

  UNAUTHORIZED: {
    en: {
      title: 'Authentication Required',
      description: 'Please sign in to access this feature.',
      action: 'login',
      actionLabel: 'Sign In',
    },
    ko: {
      title: '로그인 필요',
      description: '이 기능을 사용하려면 로그인이 필요합니다.',
      action: 'login',
      actionLabel: '로그인',
    },
  },

  // 권한 에러
  FORBIDDEN: {
    en: {
      title: 'Access Denied',
      description: 'You don\'t have permission to perform this action.',
      action: 'none',
    },
    ko: {
      title: '접근 거부',
      description: '이 작업을 수행할 권한이 없습니다.',
      action: 'none',
    },
  },

  SUBSCRIPTION_REQUIRED: {
    en: {
      title: 'Subscription Required',
      description: 'This feature requires an active subscription.',
      action: 'upgrade',
      actionLabel: 'View Plans',
    },
    ko: {
      title: '구독 필요',
      description: '이 기능을 사용하려면 구독이 필요합니다.',
      action: 'upgrade',
      actionLabel: '요금제 보기',
    },
  },

  USAGE_LIMIT_EXCEEDED: {
    en: {
      title: 'Usage Limit Reached',
      description: 'You\'ve reached your usage limit. Upgrade your plan for more.',
      action: 'upgrade',
      actionLabel: 'Upgrade',
    },
    ko: {
      title: '사용량 한도 초과',
      description: '사용량 한도에 도달했습니다. 더 많은 사용을 위해 업그레이드하세요.',
      action: 'upgrade',
      actionLabel: '업그레이드',
    },
  },

  PLAN_LIMIT_EXCEEDED: {
    en: {
      title: 'Plan Limit Reached',
      description: 'You\'ve reached your plan\'s limit for this feature.',
      action: 'upgrade',
      actionLabel: 'Upgrade Plan',
    },
    ko: {
      title: '플랜 한도 초과',
      description: '현재 플랜의 해당 기능 사용 한도에 도달했습니다.',
      action: 'upgrade',
      actionLabel: '플랜 업그레이드',
    },
  },

  // Rate Limit
  RATE_LIMIT_EXCEEDED: {
    en: {
      title: 'Too Many Requests',
      description: 'Please wait a moment before trying again.',
      action: 'wait',
      actionLabel: 'Wait',
    },
    ko: {
      title: '요청 횟수 초과',
      description: '잠시 후에 다시 시도해주세요.',
      action: 'wait',
      actionLabel: '대기',
    },
  },

  // 검증 에러
  VALIDATION_ERROR: {
    en: {
      title: 'Invalid Input',
      description: 'Please check your input and try again.',
      action: 'fix_input',
      actionLabel: 'Fix Input',
    },
    ko: {
      title: '입력 오류',
      description: '입력 내용을 확인하고 다시 시도해주세요.',
      action: 'fix_input',
      actionLabel: '수정하기',
    },
  },

  REQUIRED_FIELD_MISSING: {
    en: {
      title: 'Required Field Missing',
      description: 'Please fill in all required fields.',
      action: 'fix_input',
      actionLabel: 'Fill Fields',
    },
    ko: {
      title: '필수 필드 누락',
      description: '모든 필수 필드를 입력해주세요.',
      action: 'fix_input',
      actionLabel: '입력하기',
    },
  },

  // 결제 에러
  PAYMENT_FAILED: {
    en: {
      title: 'Payment Failed',
      description: 'Your payment could not be processed. Please try again.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    ko: {
      title: '결제 실패',
      description: '결제를 처리할 수 없습니다. 다시 시도해주세요.',
      action: 'retry',
      actionLabel: '다시 시도',
    },
  },

  CARD_DECLINED: {
    en: {
      title: 'Card Declined',
      description: 'Your card was declined. Please try a different payment method.',
      action: 'fix_input',
      actionLabel: 'Update Card',
    },
    ko: {
      title: '카드 거절',
      description: '카드가 거절되었습니다. 다른 결제 수단을 시도해주세요.',
      action: 'fix_input',
      actionLabel: '카드 변경',
    },
  },

  SUBSCRIPTION_EXPIRED: {
    en: {
      title: 'Subscription Expired',
      description: 'Your subscription has expired. Renew to continue using premium features.',
      action: 'upgrade',
      actionLabel: 'Renew',
    },
    ko: {
      title: '구독 만료',
      description: '구독이 만료되었습니다. 프리미엄 기능을 계속 사용하려면 갱신하세요.',
      action: 'upgrade',
      actionLabel: '갱신하기',
    },
  },

  // AI 서비스 에러
  AI_SERVICE_ERROR: {
    en: {
      title: 'AI Service Error',
      description: 'The AI service is temporarily unavailable. Please try again.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    ko: {
      title: 'AI 서비스 오류',
      description: 'AI 서비스를 일시적으로 사용할 수 없습니다. 다시 시도해주세요.',
      action: 'retry',
      actionLabel: '다시 시도',
    },
  },

  AI_RATE_LIMITED: {
    en: {
      title: 'AI Service Busy',
      description: 'The AI service is experiencing high demand. Please try again in a moment.',
      action: 'wait',
      actionLabel: 'Wait',
    },
    ko: {
      title: 'AI 서비스 혼잡',
      description: 'AI 서비스 사용량이 많습니다. 잠시 후 다시 시도해주세요.',
      action: 'wait',
      actionLabel: '대기',
    },
  },

  AI_CONTENT_POLICY_VIOLATION: {
    en: {
      title: 'Content Policy Violation',
      description: 'Your request was flagged by our content policy. Please modify your input.',
      action: 'fix_input',
      actionLabel: 'Modify Input',
    },
    ko: {
      title: '콘텐츠 정책 위반',
      description: '요청이 콘텐츠 정책에 의해 거부되었습니다. 입력 내용을 수정해주세요.',
      action: 'fix_input',
      actionLabel: '수정하기',
    },
  },

  SCRIPT_GENERATION_ERROR: {
    en: {
      title: 'Script Generation Failed',
      description: 'Failed to generate script. Please try with different settings.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    ko: {
      title: '스크립트 생성 실패',
      description: '스크립트 생성에 실패했습니다. 다른 설정으로 시도해보세요.',
      action: 'retry',
      actionLabel: '다시 시도',
    },
  },

  THUMBNAIL_GENERATION_ERROR: {
    en: {
      title: 'Thumbnail Generation Failed',
      description: 'Failed to generate thumbnail. Please try with different settings.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    ko: {
      title: '썸네일 생성 실패',
      description: '썸네일 생성에 실패했습니다. 다른 설정으로 시도해보세요.',
      action: 'retry',
      actionLabel: '다시 시도',
    },
  },

  // 서버 에러
  INTERNAL_ERROR: {
    en: {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Please try again or contact support.',
      action: 'retry',
      actionLabel: 'Try Again',
      helpUrl: '/help',
    },
    ko: {
      title: '오류 발생',
      description: '예상치 못한 오류가 발생했습니다. 다시 시도하거나 지원팀에 문의하세요.',
      action: 'retry',
      actionLabel: '다시 시도',
      helpUrl: '/help',
    },
  },

  SERVICE_UNAVAILABLE: {
    en: {
      title: 'Service Unavailable',
      description: 'The service is temporarily unavailable. Please try again later.',
      action: 'wait',
      actionLabel: 'Wait',
    },
    ko: {
      title: '서비스 이용 불가',
      description: '서비스를 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
      action: 'wait',
      actionLabel: '대기',
    },
  },

  // 리소스 에러
  NOT_FOUND: {
    en: {
      title: 'Not Found',
      description: 'The requested resource could not be found.',
      action: 'none',
    },
    ko: {
      title: '찾을 수 없음',
      description: '요청한 리소스를 찾을 수 없습니다.',
      action: 'none',
    },
  },

  // 기본 에러
  UNKNOWN_ERROR: {
    en: {
      title: 'Error',
      description: 'An error occurred. Please try again.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    ko: {
      title: '오류',
      description: '오류가 발생했습니다. 다시 시도해주세요.',
      action: 'retry',
      actionLabel: '다시 시도',
    },
  },
};

/**
 * 에러 코드로 메시지 가져오기
 */
export function getErrorMessage(
  code: string,
  locale: SupportedLocale = 'en'
): ErrorMessage {
  const messages = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  return messages[locale] || messages.en;
}

/**
 * 에러 객체에서 사용자 친화적 메시지 추출
 */
export function getUserFriendlyMessage(
  error: unknown,
  locale: SupportedLocale = 'en'
): ErrorMessage {
  // AppError 타입 체크
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  ) {
    return getErrorMessage((error as { code: string }).code, locale);
  }

  // 일반 Error
  if (error instanceof Error) {
    // 네트워크 에러 감지
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return getErrorMessage('NETWORK_ERROR', locale);
    }
    if (error.message.includes('timeout')) {
      return getErrorMessage('TIMEOUT', locale);
    }
  }

  return getErrorMessage('UNKNOWN_ERROR', locale);
}

/**
 * 에러 액션에 따른 URL 생성
 */
export function getActionUrl(action: ErrorAction, returnUrl?: string): string | null {
  switch (action) {
    case 'login':
      return returnUrl ? `/login?redirect=${encodeURIComponent(returnUrl)}` : '/login';
    case 'upgrade':
      return '/settings?tab=billing';
    case 'contact':
      return '/help';
    default:
      return null;
  }
}

/**
 * 에러에 대한 재시도 권장 시간 계산
 */
export function getRetryDelay(error: unknown, attempt: number = 1): number {
  const baseDelay = 1000; // 1초
  const maxDelay = 30000; // 30초

  // retryAfter가 있으면 사용
  if (
    typeof error === 'object' &&
    error !== null &&
    'retryAfter' in error &&
    typeof (error as Record<string, unknown>).retryAfter === 'number'
  ) {
    return (error as { retryAfter: number }).retryAfter * 1000;
  }

  // Exponential backoff
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  // Jitter 추가 (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}
