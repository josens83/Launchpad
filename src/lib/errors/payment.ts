/**
 * 결제 관련 에러 클래스
 * Lemon Squeezy, Stripe 등 결제 서비스 에러 처리
 */

import { AppError, ErrorOptions } from './base';

/**
 * 결제 에러 기본 클래스
 */
export class PaymentError extends AppError {
  public readonly paymentProvider: string;
  public readonly transactionId?: string;

  constructor(
    message: string,
    options: ErrorOptions & {
      paymentProvider?: string;
      transactionId?: string;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'PAYMENT_ERROR',
      statusCode: options.statusCode || 402,
      category: 'payment',
      severity: options.severity || 'high',
    });
    this.paymentProvider = options.paymentProvider || 'unknown';
    this.transactionId = options.transactionId;
  }

  /**
   * 결제 실패
   */
  static failed(reason?: string, transactionId?: string): PaymentError {
    return new PaymentError(
      reason || 'Payment failed. Please try again or use a different payment method.',
      {
        code: 'PAYMENT_FAILED',
        transactionId,
      }
    );
  }

  /**
   * 카드 거절
   */
  static cardDeclined(reason?: string): PaymentError {
    return new PaymentError(
      reason || 'Your card was declined. Please try a different card.',
      {
        code: 'CARD_DECLINED',
      }
    );
  }

  /**
   * 잔액 부족
   */
  static insufficientFunds(): PaymentError {
    return new PaymentError('Insufficient funds. Please check your balance and try again.', {
      code: 'INSUFFICIENT_FUNDS',
    });
  }

  /**
   * 카드 만료
   */
  static cardExpired(): PaymentError {
    return new PaymentError('Your card has expired. Please update your payment method.', {
      code: 'CARD_EXPIRED',
    });
  }

  /**
   * 잘못된 카드 번호
   */
  static invalidCardNumber(): PaymentError {
    return new PaymentError('Invalid card number. Please check and try again.', {
      code: 'INVALID_CARD_NUMBER',
      statusCode: 400,
      severity: 'low',
    });
  }

  /**
   * 잘못된 CVC
   */
  static invalidCvc(): PaymentError {
    return new PaymentError('Invalid security code (CVC). Please check and try again.', {
      code: 'INVALID_CVC',
      statusCode: 400,
      severity: 'low',
    });
  }

  /**
   * 처리 에러
   */
  static processingError(): PaymentError {
    return new PaymentError(
      'An error occurred while processing your payment. Please try again.',
      {
        code: 'PROCESSING_ERROR',
        retryable: true,
        retryAfter: 5,
      }
    );
  }

  /**
   * 중복 결제 방지
   */
  static duplicateTransaction(transactionId: string): PaymentError {
    return new PaymentError('This transaction has already been processed.', {
      code: 'DUPLICATE_TRANSACTION',
      transactionId,
      statusCode: 409,
    });
  }

  /**
   * 결제 취소됨
   */
  static cancelled(): PaymentError {
    return new PaymentError('Payment was cancelled.', {
      code: 'PAYMENT_CANCELLED',
      severity: 'low',
    });
  }

  /**
   * 환불 불가
   */
  static refundNotAllowed(reason?: string): PaymentError {
    return new PaymentError(
      reason || 'This transaction cannot be refunded.',
      {
        code: 'REFUND_NOT_ALLOWED',
      }
    );
  }

  /**
   * 환불 실패
   */
  static refundFailed(reason?: string): PaymentError {
    return new PaymentError(
      reason || 'Refund failed. Please contact support.',
      {
        code: 'REFUND_FAILED',
      }
    );
  }
}

/**
 * 구독 관련 에러
 */
export class SubscriptionError extends AppError {
  public readonly subscriptionId?: string;
  public readonly planId?: string;

  constructor(
    message: string,
    options: ErrorOptions & {
      subscriptionId?: string;
      planId?: string;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'SUBSCRIPTION_ERROR',
      statusCode: options.statusCode || 402,
      category: 'payment',
      severity: options.severity || 'medium',
    });
    this.subscriptionId = options.subscriptionId;
    this.planId = options.planId;
  }

  /**
   * 구독 없음
   */
  static notFound(subscriptionId?: string): SubscriptionError {
    return new SubscriptionError('Subscription not found.', {
      code: 'SUBSCRIPTION_NOT_FOUND',
      subscriptionId,
      statusCode: 404,
    });
  }

  /**
   * 구독 만료
   */
  static expired(subscriptionId?: string): SubscriptionError {
    return new SubscriptionError('Your subscription has expired. Please renew to continue.', {
      code: 'SUBSCRIPTION_EXPIRED',
      subscriptionId,
    });
  }

  /**
   * 구독 취소됨
   */
  static cancelled(subscriptionId?: string): SubscriptionError {
    return new SubscriptionError('This subscription has been cancelled.', {
      code: 'SUBSCRIPTION_CANCELLED',
      subscriptionId,
      severity: 'low',
    });
  }

  /**
   * 구독 일시정지됨
   */
  static paused(subscriptionId?: string): SubscriptionError {
    return new SubscriptionError('Your subscription is paused. Please resume to continue.', {
      code: 'SUBSCRIPTION_PAUSED',
      subscriptionId,
    });
  }

  /**
   * 플랜 변경 불가
   */
  static cannotChangePlan(reason?: string): SubscriptionError {
    return new SubscriptionError(
      reason || 'Unable to change plan at this time.',
      {
        code: 'CANNOT_CHANGE_PLAN',
      }
    );
  }

  /**
   * 다운그레이드 불가
   */
  static cannotDowngrade(reason?: string): SubscriptionError {
    return new SubscriptionError(
      reason || 'Cannot downgrade plan due to current usage.',
      {
        code: 'CANNOT_DOWNGRADE',
      }
    );
  }

  /**
   * 무료 플랜 제한
   */
  static freePlanLimit(feature: string): SubscriptionError {
    return new SubscriptionError(
      `${feature} is not available on the free plan. Please upgrade to continue.`,
      {
        code: 'FREE_PLAN_LIMIT',
        context: {
          metadata: { feature },
        },
      }
    );
  }

  /**
   * 플랜 제한 초과
   */
  static planLimitExceeded(
    feature: string,
    limit: number,
    current: number
  ): SubscriptionError {
    return new SubscriptionError(
      `You've reached your ${feature} limit (${current}/${limit}). Please upgrade your plan.`,
      {
        code: 'PLAN_LIMIT_EXCEEDED',
        context: {
          metadata: { feature, limit, current },
        },
      }
    );
  }

  /**
   * 결제 정보 필요
   */
  static paymentMethodRequired(): SubscriptionError {
    return new SubscriptionError('Please add a payment method to subscribe.', {
      code: 'PAYMENT_METHOD_REQUIRED',
    });
  }

  /**
   * 결제 실패로 인한 구독 중단
   */
  static paymentFailed(subscriptionId?: string): SubscriptionError {
    return new SubscriptionError(
      'Your subscription payment failed. Please update your payment method.',
      {
        code: 'SUBSCRIPTION_PAYMENT_FAILED',
        subscriptionId,
      }
    );
  }

  /**
   * 시험 기간 종료
   */
  static trialEnded(): SubscriptionError {
    return new SubscriptionError('Your trial period has ended. Please subscribe to continue.', {
      code: 'TRIAL_ENDED',
    });
  }

  /**
   * 이미 구독 중
   */
  static alreadySubscribed(planId?: string): SubscriptionError {
    return new SubscriptionError('You already have an active subscription.', {
      code: 'ALREADY_SUBSCRIBED',
      planId,
      statusCode: 409,
    });
  }
}

/**
 * 웹훅 관련 에러
 */
export class WebhookError extends AppError {
  public readonly webhookId?: string;
  public readonly eventType?: string;

  constructor(
    message: string,
    options: ErrorOptions & {
      webhookId?: string;
      eventType?: string;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'WEBHOOK_ERROR',
      statusCode: options.statusCode || 400,
      category: 'payment',
      severity: options.severity || 'high',
    });
    this.webhookId = options.webhookId;
    this.eventType = options.eventType;
  }

  /**
   * 서명 검증 실패
   */
  static invalidSignature(): WebhookError {
    return new WebhookError('Invalid webhook signature', {
      code: 'INVALID_WEBHOOK_SIGNATURE',
      statusCode: 401,
      severity: 'critical',
    });
  }

  /**
   * 중복 웹훅
   */
  static duplicate(webhookId: string): WebhookError {
    return new WebhookError('Duplicate webhook received', {
      code: 'DUPLICATE_WEBHOOK',
      webhookId,
      statusCode: 200, // 200 반환하여 재전송 방지
      severity: 'low',
    });
  }

  /**
   * 알 수 없는 이벤트 타입
   */
  static unknownEventType(eventType: string): WebhookError {
    return new WebhookError(`Unknown webhook event type: ${eventType}`, {
      code: 'UNKNOWN_WEBHOOK_EVENT',
      eventType,
      severity: 'low',
    });
  }

  /**
   * 페이로드 파싱 실패
   */
  static invalidPayload(reason?: string): WebhookError {
    return new WebhookError(
      reason || 'Invalid webhook payload',
      {
        code: 'INVALID_WEBHOOK_PAYLOAD',
      }
    );
  }

  /**
   * 처리 실패
   */
  static processingFailed(eventType: string, reason?: string): WebhookError {
    return new WebhookError(
      reason || `Failed to process webhook: ${eventType}`,
      {
        code: 'WEBHOOK_PROCESSING_FAILED',
        eventType,
        retryable: true,
      }
    );
  }
}
