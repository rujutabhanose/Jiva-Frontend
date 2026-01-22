/**
 * Error handling utilities for user-friendly error messages
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  BAD_IMAGE = 'BAD_IMAGE',
  BACKEND_DOWN = 'BACKEND_DOWN',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

export interface UserFriendlyError {
  type: ErrorType;
  title: string;
  message: string;
  canRetry: boolean;
  retryDelay?: number; // milliseconds
}

/**
 * Categorize and convert errors to user-friendly messages
 */
export function categorizeError(error: any): UserFriendlyError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.',
      canRetry: true,
      retryDelay: 2000,
    };
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      title: 'Request Timed Out',
      message: 'The request took too long. Please check your connection and try again.',
      canRetry: true,
      retryDelay: 3000,
    };
  }

  // Bad image errors (from backend quality_gate)
  const lowerMessage = error.message?.toLowerCase() || '';
  if (
    lowerMessage.includes('no leaf') ||
    lowerMessage.includes('no plant') ||
    lowerMessage.includes('invalid image') ||
    lowerMessage.includes('unable to detect') ||
    lowerMessage.includes('low quality') ||
    lowerMessage.includes('quality') ||
    lowerMessage.includes('blurry') ||
    lowerMessage.includes('diagnosis failed') ||
    lowerMessage.includes('not visible') ||
    (error.response?.status === 400 && lowerMessage.includes('image'))
  ) {
    return {
      type: ErrorType.BAD_IMAGE,
      title: 'Image Not Clear',
      message: 'The image quality is not good enough or the leaf is not clearly visible. Please upload a clearer photo.',
      canRetry: true,
      retryDelay: 0,
    };
  }

  // Backend downtime (5xx errors)
  if (
    error.response?.status >= 500 ||
    error.message?.includes('500') ||
    error.message?.includes('502') ||
    error.message?.includes('503') ||
    error.message?.includes('504')
  ) {
    return {
      type: ErrorType.BACKEND_DOWN,
      title: 'Service Temporarily Unavailable',
      message: 'Our servers are currently experiencing issues. Please try again in a few moments. We\'re working to fix this as quickly as possible.',
      canRetry: true,
      retryDelay: 5000,
    };
  }

  // Email Not Verified (403)
  if (error.response?.status === 403 || error.message?.toLowerCase().includes('verify your email')) {
    return {
      type: ErrorType.EMAIL_NOT_VERIFIED,
      title: 'Email Not Verified',
      message: 'Please check your email and click the verification link to continue. Check your spam folder if you don\'t see it.',
      canRetry: false,
    };
  }

  // Unauthorized (401)
  if (error.response?.status === 401 || error.message?.includes('401')) {
    return {
      type: ErrorType.UNAUTHORIZED,
      title: 'Authentication Required',
      message: 'Your session has expired. Please restart the app.',
      canRetry: false,
    };
  }

  // Payment Required (402) - Scan limit reached
  if (error.response?.status === 402 || error.message?.includes('402') || error.message?.toLowerCase().includes('payment required')) {
    return {
      type: ErrorType.RATE_LIMIT,
      title: 'Free Scans Exhausted',
      message: 'You\'ve used all your free scans. Upgrade to continue scanning your plants.',
      canRetry: false,
    };
  }

  // Rate limiting (429)
  if (error.response?.status === 429 || error.message?.includes('429')) {
    return {
      type: ErrorType.RATE_LIMIT,
      title: 'Too Many Requests',
      message: 'You\'ve made too many requests. Please wait a moment before trying again.',
      canRetry: true,
      retryDelay: 10000,
    };
  }

  // Invalid response format
  if (
    error.message?.includes('JSON') ||
    error.message?.includes('parse') ||
    error.message?.includes('Unexpected token') ||
    error.message?.includes('No plant identification results') ||
    error.message?.includes('No diagnosis results')
  ) {
    return {
      type: ErrorType.INVALID_RESPONSE,
      title: 'Unexpected Response',
      message: 'We received an unexpected response from our servers. Please try again. If the problem persists, contact support.',
      canRetry: true,
      retryDelay: 2000,
    };
  }

  // Generic network error
  if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      title: 'Network Error',
      message: 'Unable to reach our servers. Please check your internet connection.',
      canRetry: true,
      retryDelay: 2000,
    };
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    title: 'Something Went Wrong',
    message: error.message || 'An unexpected error occurred. Please try again. If the problem continues, contact support.',
    canRetry: true,
    retryDelay: 2000,
  };
}

/**
 * Extract error details from API response
 */
export async function extractApiError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data.detail || data.message || data.error || `Server error (${response.status})`;
    } else {
      const text = await response.text();
      return text || `Server error (${response.status})`;
    }
  } catch (e) {
    return `Server error (${response.status})`;
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: UserFriendlyError): boolean {
  return error.canRetry &&
    error.type !== ErrorType.BAD_IMAGE &&
    error.type !== ErrorType.UNAUTHORIZED &&
    error.type !== ErrorType.EMAIL_NOT_VERIFIED;
}

