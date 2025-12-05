/**
 * 인증/인가 관련 에러 클래스
 */

import { AppError, ErrorOptions } from './base';

/**
 * 인증 에러 - 로그인, 토큰 검증 등
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', options: ErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code || 'AUTHENTICATION_FAILED',
      statusCode: 401,
      category: 'authentication',
      severity: 'medium',
    });
  }

  /**
   * 잘못된 자격 증명
   */
  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError('Invalid email or password', {
      code: 'INVALID_CREDENTIALS',
    });
  }

  /**
   * 만료된 토큰
   */
  static tokenExpired(): AuthenticationError {
    return new AuthenticationError('Your session has expired. Please sign in again.', {
      code: 'TOKEN_EXPIRED',
    });
  }

  /**
   * 유효하지 않은 토큰
   */
  static invalidToken(): AuthenticationError {
    return new AuthenticationError('Invalid authentication token', {
      code: 'INVALID_TOKEN',
    });
  }

  /**
   * 누락된 토큰
   */
  static missingToken(): AuthenticationError {
    return new AuthenticationError('Authentication required. Please sign in.', {
      code: 'MISSING_TOKEN',
    });
  }

  /**
   * 토큰 취소됨 (로그아웃, 비밀번호 변경 등)
   */
  static tokenRevoked(): AuthenticationError {
    return new AuthenticationError('Your session has been revoked. Please sign in again.', {
      code: 'TOKEN_REVOKED',
    });
  }

  /**
   * 계정 비활성화
   */
  static accountDisabled(): AuthenticationError {
    return new AuthenticationError('Your account has been disabled. Please contact support.', {
      code: 'ACCOUNT_DISABLED',
      severity: 'high',
    });
  }

  /**
   * 이메일 미인증
   */
  static emailNotVerified(): AuthenticationError {
    return new AuthenticationError('Please verify your email address before signing in.', {
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  /**
   * 비밀번호 재설정 필요
   */
  static passwordResetRequired(): AuthenticationError {
    return new AuthenticationError('Password reset required. Please reset your password.', {
      code: 'PASSWORD_RESET_REQUIRED',
    });
  }

  /**
   * MFA 필요
   */
  static mfaRequired(): AuthenticationError {
    return new AuthenticationError('Multi-factor authentication required', {
      code: 'MFA_REQUIRED',
    });
  }

  /**
   * MFA 코드 잘못됨
   */
  static invalidMfaCode(): AuthenticationError {
    return new AuthenticationError('Invalid verification code', {
      code: 'INVALID_MFA_CODE',
    });
  }

  /**
   * OAuth 에러
   */
  static oauthError(provider: string, reason?: string): AuthenticationError {
    const message = reason
      ? `${provider} authentication failed: ${reason}`
      : `${provider} authentication failed`;
    return new AuthenticationError(message, {
      code: 'OAUTH_ERROR',
      context: {
        metadata: { provider, reason },
      },
    });
  }

  /**
   * 세션 만료
   */
  static sessionExpired(): AuthenticationError {
    return new AuthenticationError('Your session has expired. Please sign in again.', {
      code: 'SESSION_EXPIRED',
    });
  }

  /**
   * 동시 세션 초과
   */
  static tooManySessions(): AuthenticationError {
    return new AuthenticationError('Too many active sessions. Please sign out from other devices.', {
      code: 'TOO_MANY_SESSIONS',
    });
  }
}

/**
 * 인가 에러 - 권한 부족
 */
export class AuthorizationError extends AppError {
  public readonly requiredRole?: string;
  public readonly requiredPermission?: string;
  public readonly resource?: string;

  constructor(
    message = 'Access denied',
    options: ErrorOptions & {
      requiredRole?: string;
      requiredPermission?: string;
      resource?: string;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'AUTHORIZATION_FAILED',
      statusCode: 403,
      category: 'authorization',
      severity: 'medium',
    });
    this.requiredRole = options.requiredRole;
    this.requiredPermission = options.requiredPermission;
    this.resource = options.resource;
  }

  /**
   * 권한 부족
   */
  static insufficientPermissions(permission?: string): AuthorizationError {
    return new AuthorizationError(
      permission
        ? `You don't have permission to ${permission}`
        : 'You don\'t have permission to perform this action',
      {
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermission: permission,
      }
    );
  }

  /**
   * 역할 필요
   */
  static roleRequired(role: string): AuthorizationError {
    return new AuthorizationError(`This action requires ${role} role`, {
      code: 'ROLE_REQUIRED',
      requiredRole: role,
    });
  }

  /**
   * 리소스 접근 불가
   */
  static resourceAccessDenied(resource: string): AuthorizationError {
    return new AuthorizationError(`You don't have access to this ${resource}`, {
      code: 'RESOURCE_ACCESS_DENIED',
      resource,
    });
  }

  /**
   * 소유권 필요
   */
  static ownershipRequired(): AuthorizationError {
    return new AuthorizationError('You can only access your own resources', {
      code: 'OWNERSHIP_REQUIRED',
    });
  }

  /**
   * 구독 필요
   */
  static subscriptionRequired(plan?: string): AuthorizationError {
    const message = plan
      ? `This feature requires a ${plan} subscription`
      : 'This feature requires an active subscription';
    return new AuthorizationError(message, {
      code: 'SUBSCRIPTION_REQUIRED',
      context: {
        metadata: { requiredPlan: plan },
      },
    });
  }

  /**
   * 사용량 한도 초과
   */
  static usageLimitExceeded(feature: string, limit: number): AuthorizationError {
    return new AuthorizationError(
      `You've reached your ${feature} limit (${limit}). Please upgrade your plan.`,
      {
        code: 'USAGE_LIMIT_EXCEEDED',
        context: {
          metadata: { feature, limit },
        },
      }
    );
  }

  /**
   * 팀 권한 부족
   */
  static teamPermissionDenied(teamId: string): AuthorizationError {
    return new AuthorizationError('You don\'t have permission to access this team resource', {
      code: 'TEAM_PERMISSION_DENIED',
      context: {
        metadata: { teamId },
      },
    });
  }

  /**
   * API 키 권한 부족
   */
  static apiKeyPermissionDenied(scope: string): AuthorizationError {
    return new AuthorizationError(`API key doesn't have required scope: ${scope}`, {
      code: 'API_KEY_SCOPE_DENIED',
      context: {
        metadata: { requiredScope: scope },
      },
    });
  }

  /**
   * 기능 비활성화
   */
  static featureDisabled(feature: string): AuthorizationError {
    return new AuthorizationError(`The ${feature} feature is currently disabled`, {
      code: 'FEATURE_DISABLED',
      context: {
        metadata: { feature },
      },
    });
  }

  /**
   * 지역 제한
   */
  static regionRestricted(region: string): AuthorizationError {
    return new AuthorizationError(`This feature is not available in your region (${region})`, {
      code: 'REGION_RESTRICTED',
      context: {
        metadata: { region },
      },
    });
  }

  /**
   * IP 차단
   */
  static ipBlocked(ip: string): AuthorizationError {
    return new AuthorizationError('Access from your IP address has been blocked', {
      code: 'IP_BLOCKED',
      severity: 'high',
      context: {
        metadata: { ip },
      },
    });
  }
}

/**
 * 보안 관련 에러
 */
export class SecurityError extends AppError {
  constructor(message = 'Security violation detected', options: ErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code || 'SECURITY_ERROR',
      statusCode: 403,
      category: 'authorization',
      severity: 'critical',
    });
  }

  /**
   * CSRF 토큰 유효하지 않음
   */
  static invalidCsrfToken(): SecurityError {
    return new SecurityError('Invalid or missing CSRF token', {
      code: 'INVALID_CSRF_TOKEN',
    });
  }

  /**
   * 의심스러운 활동 감지
   */
  static suspiciousActivity(reason?: string): SecurityError {
    return new SecurityError(
      reason
        ? `Suspicious activity detected: ${reason}`
        : 'Suspicious activity detected',
      {
        code: 'SUSPICIOUS_ACTIVITY',
      }
    );
  }

  /**
   * IP 변경 감지
   */
  static ipMismatch(): SecurityError {
    return new SecurityError('Session IP address mismatch detected', {
      code: 'IP_MISMATCH',
    });
  }

  /**
   * User Agent 변경 감지
   */
  static userAgentMismatch(): SecurityError {
    return new SecurityError('Session User-Agent mismatch detected', {
      code: 'USER_AGENT_MISMATCH',
    });
  }

  /**
   * 무차별 대입 공격 감지
   */
  static bruteForceDetected(): SecurityError {
    return new SecurityError('Too many failed attempts. Please try again later.', {
      code: 'BRUTE_FORCE_DETECTED',
      severity: 'critical',
    });
  }
}
