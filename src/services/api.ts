import { API_ENDPOINTS } from '../config/api';
import { extractApiError, categorizeError, UserFriendlyError, ErrorType, isRetryableError } from '../utils/errorHandler';

export interface PlantIdentificationResult {
  plant_name: string;
  scientific_name?: string | null;
  family?: string | null;
  confidence: number;
  confidence_percent: number;
  plantInfo?: any | null;
}

export interface DiagnosisResult {
  condition: string;
  confidence: number;
  symptoms?: string[];
  causes?: string[];
  treatment?: string[];
  category?: string;
  severity?: string;
  plant_name?: string;
}

export interface ApiError extends Error {
  userFriendlyError?: UserFriendlyError;
  statusCode?: number;
}

export interface UserData {
  id: number;
  email: string;
  name: string;
  country?: string;
  userType?: string;
  plantTypes?: string[];
  isPremium: boolean;
  freeScansLeft: number;
  indiaFreeExpiresAt?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserData;
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
}

// Prevent concurrent refresh attempts
let isRefreshing = false;

/**
 * Safe fetch with timeout and error handling.
 * On 401, silently attempts to refresh the access token and retries the request once.
 * @param skipRefresh - internal flag to prevent recursive refresh calls
 */
async function safeFetch(url: string, options: RequestInit, timeoutMs: number = 30000, skipRefresh: boolean = false): Promise<Response> {
  try {
    console.log('[safeFetch] Request to:', url);
    console.log('[safeFetch] Headers:', JSON.stringify(options.headers || {}, null, 2));

    const fetchPromise = fetch(url, options);
    const timeoutPromise = createTimeoutPromise(timeoutMs);

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response) {
      throw new Error('No response received');
    }

    console.log('[safeFetch] Response status:', response.status, 'for URL:', url);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('[safeFetch] 401 Unauthorized');
      console.warn('[safeFetch] Failed URL:', url);

      const { ErrorType } = await import('../utils/errorHandler');

      // Login 401 = invalid credentials, not session expiry
      const isLoginRequest = url.includes('/auth/login');
      if (isLoginRequest) {
        const authError: ApiError = new Error('Invalid email or password.');
        authError.statusCode = 401;
        authError.userFriendlyError = {
          type: ErrorType.UNAUTHORIZED,
          title: 'Sign In Failed',
          message: 'Invalid email or password. Please try again.',
          canRetry: true,
        };
        throw authError;
      }

      // Try a silent token refresh (only once, never on the refresh call itself)
      if (!skipRefresh && !isRefreshing) {
        const { storage } = await import('../utils/storage');
        const refreshToken = await storage.getRefreshToken();

        if (refreshToken) {
          isRefreshing = true;
          try {
            const refreshResponse = await safeFetch(
              API_ENDPOINTS.REFRESH,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
              },
              15000,
              true, // skipRefresh — don't recurse
            );

            if (refreshResponse.ok) {
              const tokens = await refreshResponse.json();
              await storage.setToken(tokens.access_token);
              await storage.setRefreshToken(tokens.refresh_token);
              console.log('[safeFetch] Token refreshed successfully, retrying original request');

              // Retry original request with new access token
              const newHeaders: Record<string, string> = {
                ...(options.headers as Record<string, string>),
                Authorization: `Bearer ${tokens.access_token}`,
              };
              return safeFetch(url, { ...options, headers: newHeaders }, timeoutMs, true);
            }
          } catch (refreshErr) {
            console.warn('[safeFetch] Token refresh failed:', refreshErr);
          } finally {
            isRefreshing = false;
          }
        }
      }

      // Refresh unavailable or failed — session truly expired
      const authError: ApiError = new Error('Session expired. Please log in again.');
      authError.statusCode = 401;
      authError.userFriendlyError = {
        type: ErrorType.UNAUTHORIZED,
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        canRetry: false,
      };
      throw authError;
    }

    return response;
  } catch (error: any) {
    if (error.statusCode === 401) {
      throw error;
    }

    const enhancedError: ApiError = error instanceof Error ? error : new Error(String(error));
    enhancedError.userFriendlyError = categorizeError(error);
    throw enhancedError;
  }
}

/**
 * Safe JSON parsing with error handling
 */
function safeJsonParse<T>(data: any): T {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as T;
    }
    return data as T;
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }
}

/**
 * Retry configuration for transient errors
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 2000,
  maxDelay: 8000,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute an async function with automatic retry for transient errors
 * Uses exponential backoff: 2s, 4s, 8s
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if this error is retryable
      const userFriendlyError = error.userFriendlyError || categorizeError(error);

      // Don't retry non-retryable errors
      if (!isRetryableError(userFriendlyError)) {
        throw error;
      }

      // Don't retry if we've exhausted all attempts
      if (attempt >= config.maxRetries) {
        console.log(`[withRetry] All ${config.maxRetries} retries exhausted`);
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );

      console.log(`[withRetry] Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError;
}

export async function identifyPlant(imageUri: string): Promise<PlantIdentificationResult> {
  // Get authentication token first (not retryable)
  const { storage } = await import('../utils/storage');
  const token = await storage.getToken();

  if (!token) {
    const authError: ApiError = new Error('Authentication required. Please log in to identify plants.');
    authError.userFriendlyError = categorizeError({ message: 'Authentication required' });
    throw authError;
  }

  // Wrap the API call in retry logic for transient errors
  return withRetry(async () => {
    const formData = new FormData();

    // Append file with proper image/jpeg content type
    formData.append('file', {
      uri: imageUri,
      name: 'plant.jpg',
      type: 'image/jpeg',
    } as any);

    let response: Response;
    try {
      response = await safeFetch(API_ENDPOINTS.IDENTIFY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      }, 30000); // 30 second timeout
    } catch (error: any) {
      // Network/timeout errors are already categorized
      if (error.userFriendlyError) {
        const apiError: ApiError = new Error(error.userFriendlyError.message);
        apiError.userFriendlyError = error.userFriendlyError;
        throw apiError;
      }
      // Re-throw with categorization
      const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
      apiError.userFriendlyError = categorizeError(error);
      throw apiError;
    }

    // Handle non-OK responses
    if (!response.ok) {
      try {
        const errorDetail = await extractApiError(response);
        const apiError: ApiError = new Error(errorDetail);
        apiError.statusCode = response.status;

        // Special handling for 402 Payment Required
        if (response.status === 402) {
          apiError.userFriendlyError = categorizeError({
            message: 'Payment required',
            response: { status: 402 },
          });
        } else {
          apiError.userFriendlyError = categorizeError({
            message: errorDetail,
            response: { status: response.status },
          });
        }
        throw apiError;
      } catch (error: any) {
        // If we can't parse the error, create a generic one
        if (!error.userFriendlyError) {
          const apiError: ApiError = new Error(`Server error (${response.status})`);
          apiError.statusCode = response.status;
          apiError.userFriendlyError = categorizeError({
            message: `Server error (${response.status})`,
            response: { status: response.status },
          });
          throw apiError;
        }
        throw error;
      }
    }

    // Parse response safely
    let data: any;
    try {
      data = await response.json();
    } catch (error) {
      const parseError: ApiError = new Error('Invalid response format');
      parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
      throw parseError;
    }

    // Validate response structure
    if (!data || typeof data !== 'object') {
      const validationError: ApiError = new Error('Invalid response format');
      validationError.userFriendlyError = categorizeError({ message: 'Invalid response format' });
      throw validationError;
    }

    // Check if identification failed (e.g., bad image quality)
    if (data.success === false) {
      const reason = data.reason || 'Unable to identify plant. Please try with a clearer image.';
      const qualityError: ApiError = new Error(reason);
      qualityError.userFriendlyError = {
        type: ErrorType.BAD_IMAGE,
        title: 'Image Quality Issue',
        message: reason,
        canRetry: true,
      };
      throw qualityError;
    }

    // Extract the first result from the API response
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      const result = data.results[0];
      // Validate result structure
      if (!result.plant_name || typeof result.confidence === 'undefined') {
        const validationError: ApiError = new Error('Invalid result format');
        validationError.userFriendlyError = categorizeError({ message: 'Invalid result format' });
        throw validationError;
      }
      return result;
    }

    // No results found - could be bad image
    const noResultsError: ApiError = new Error('No plant identification results found. Please ensure the image contains a clear view of a plant or leaf.');
    noResultsError.userFriendlyError = categorizeError({ message: 'No plant identification results found' });
    throw noResultsError;
  });
}

export async function diagnosePlant(imageUri: string): Promise<DiagnosisResult> {
  // Get authentication token first (not retryable)
  const { storage } = await import('../utils/storage');
  const token = await storage.getToken();

  console.log('[diagnosePlant] Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');

  if (!token) {
    const authError: ApiError = new Error('Authentication required. Please log in to diagnose plants.');
    authError.userFriendlyError = categorizeError({ message: 'Authentication required' });
    throw authError;
  }

  // Wrap the API call in retry logic for transient errors
  return withRetry(async () => {
    const formData = new FormData();

    // Append file with proper image/jpeg content type
    formData.append('file', {
      uri: imageUri,
      name: 'plant.jpg',
      type: 'image/jpeg',
    } as any);

    console.log('[diagnosePlant] Making request to:', API_ENDPOINTS.DIAGNOSE);
    console.log('[diagnosePlant] Authorization header:', `Bearer ${token.substring(0, 20)}...`);

    let response: Response;
    try {
      response = await safeFetch(API_ENDPOINTS.DIAGNOSE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      }, 60000); // 60 second timeout (first request loads ML models)

      console.log('[diagnosePlant] Response status:', response.status);
    } catch (error: any) {
      // Network/timeout errors are already categorized
      if (error.userFriendlyError) {
        const apiError: ApiError = new Error(error.userFriendlyError.message);
        apiError.userFriendlyError = error.userFriendlyError;
        throw apiError;
      }
      // Re-throw with categorization
      const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
      apiError.userFriendlyError = categorizeError(error);
      throw apiError;
    }

    // Handle non-OK responses
    if (!response.ok) {
      try {
        const errorDetail = await extractApiError(response);
        const apiError: ApiError = new Error(errorDetail);
        apiError.statusCode = response.status;

        // Special handling for 402 Payment Required
        if (response.status === 402) {
          apiError.userFriendlyError = categorizeError({
            message: 'Payment required',
            response: { status: 402 },
          });
        } else {
          apiError.userFriendlyError = categorizeError({
            message: errorDetail,
            response: { status: response.status },
          });
        }
        throw apiError;
      } catch (error: any) {
        // If we can't parse the error, create a generic one
        if (!error.userFriendlyError) {
          const apiError: ApiError = new Error(`Server error (${response.status})`);
          apiError.statusCode = response.status;
          apiError.userFriendlyError = categorizeError({
            message: `Server error (${response.status})`,
            response: { status: response.status },
          });
          throw apiError;
        }
        throw error;
      }
    }

    // Parse response safely
    let rawData: any;
    try {
      rawData = await response.json();
      console.log('[diagnosePlant] Response data:', JSON.stringify(rawData, null, 2));
    } catch (error) {
      const parseError: ApiError = new Error('Invalid response format');
      parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
      throw parseError;
    }

    // Validate response structure
    if (!rawData || typeof rawData !== 'object') {
      const validationError: ApiError = new Error('Invalid response format');
      validationError.userFriendlyError = categorizeError({ message: 'Invalid response format' });
      throw validationError;
    }

    // Check if diagnosis was successful
    if (rawData.success === false) {
      const reason = rawData.reason || rawData.message || 'Diagnosis failed';
      const diagnosisError: ApiError = new Error(reason);
      diagnosisError.userFriendlyError = categorizeError({ message: reason });
      throw diagnosisError;
    }

    // Transform backend response to DiagnosisResult format
    // Backend returns: { success: true, diagnoses: [...], ... }
    // Frontend expects: { condition: string, confidence: number, ... }

    if (!rawData.diagnoses || !Array.isArray(rawData.diagnoses) || rawData.diagnoses.length === 0) {
      const noResultsError: ApiError = new Error('No diagnosis results found');
      noResultsError.userFriendlyError = categorizeError({
        message: 'No diagnosis results found. Please try again with a clearer image of the plant.'
      });
      throw noResultsError;
    }

    // Extract the primary diagnosis (first one, which has the highest confidence)
    const primaryDiagnosis = rawData.diagnoses[0];

    // Transform to expected format
    const data: DiagnosisResult = {
      condition: primaryDiagnosis.name || primaryDiagnosis.normalized_label || 'Unknown',
      confidence: primaryDiagnosis.confidence || 0, // Already in 0-100 scale from backend
      symptoms: primaryDiagnosis.symptoms || [],
      causes: primaryDiagnosis.causes || [],
      treatment: primaryDiagnosis.treatment || [],
      category: primaryDiagnosis.category,
      severity: primaryDiagnosis.severity,
      plant_name: rawData.plant_name || undefined,
    };

    return data;
  });
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  country: string,
  userType?: string | null,
  plantTypes?: string[],
  deviceId?: string,
  platform?: string
): Promise<AuthResponse> {
  console.log('[API] Starting registration request to:', API_ENDPOINTS.REGISTER);
  console.log('[API] Request payload:', { name, email, country, deviceId, platform });
  const startTime = Date.now();

  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        country,
        userType,
        plantTypes,
        device_id: deviceId,
        platform,
      }),
    }, 15000);
    console.log('[API] Registration request completed in', Date.now() - startTime, 'ms');
  } catch (error: any) {
    console.error('[API] Registration request failed after', Date.now() - startTime, 'ms');
    console.error('[API] Error details:', error.message, error.name);
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    try {
      const errorDetail = await extractApiError(response);
      const apiError: ApiError = new Error(errorDetail);
      apiError.statusCode = response.status;
      apiError.userFriendlyError = categorizeError({
        message: errorDetail,
        response: { status: response.status },
      });
      throw apiError;
    } catch (error: any) {
      if (!error.userFriendlyError) {
        const apiError: ApiError = new Error(`Server error (${response.status})`);
        apiError.statusCode = response.status;
        apiError.userFriendlyError = categorizeError({
          message: `Server error (${response.status})`,
          response: { status: response.status },
        });
        throw apiError;
      }
      throw error;
    }
  }

  let data: AuthResponse;
  try {
    data = await response.json();
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }

  if (!data || !data.access_token || !data.user) {
    const validationError: ApiError = new Error('Invalid registration response');
    validationError.userFriendlyError = categorizeError({ message: 'Invalid registration response' });
    throw validationError;
  }

  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    try {
      const errorDetail = await extractApiError(response);
      const apiError: ApiError = new Error(errorDetail);
      apiError.statusCode = response.status;
      apiError.userFriendlyError = categorizeError({
        message: errorDetail,
        response: { status: response.status },
      });
      throw apiError;
    } catch (error: any) {
      if (!error.userFriendlyError) {
        const apiError: ApiError = new Error(`Server error (${response.status})`);
        apiError.statusCode = response.status;
        apiError.userFriendlyError = categorizeError({
          message: `Server error (${response.status})`,
          response: { status: response.status },
        });
        throw apiError;
      }
      throw error;
    }
  }

  let data: AuthResponse;
  try {
    data = await response.json();
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }

  if (!data || !data.access_token || !data.user) {
    const validationError: ApiError = new Error('Invalid login response');
    validationError.userFriendlyError = categorizeError({ message: 'Invalid login response' });
    throw validationError;
  }

  return data;
}

// Password Reset Functions

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOTPResponse {
  valid: boolean;
  reset_token: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    const errorDetail = await extractApiError(response);
    const apiError: ApiError = new Error(errorDetail);
    apiError.statusCode = response.status;
    apiError.userFriendlyError = categorizeError({
      message: errorDetail,
      response: { status: response.status },
    });
    throw apiError;
  }

  let data: ForgotPasswordResponse;
  try {
    data = await response.json();
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }

  return data;
}

export async function verifyResetOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.VERIFY_RESET_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    const errorDetail = await extractApiError(response);
    const apiError: ApiError = new Error(errorDetail);
    apiError.statusCode = response.status;
    apiError.userFriendlyError = categorizeError({
      message: errorDetail,
      response: { status: response.status },
    });
    throw apiError;
  }

  let data: VerifyOTPResponse;
  try {
    data = await response.json();
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }

  return data;
}

export async function resetPassword(
  email: string,
  resetToken: string,
  newPassword: string
): Promise<ResetPasswordResponse> {
  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reset_token: resetToken,
        new_password: newPassword,
      }),
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    const errorDetail = await extractApiError(response);
    const apiError: ApiError = new Error(errorDetail);
    apiError.statusCode = response.status;
    apiError.userFriendlyError = categorizeError({
      message: errorDetail,
      response: { status: response.status },
    });
    throw apiError;
  }

  let data: ResetPasswordResponse;
  try {
    data = await response.json();
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }

  return data;
}

export async function checkEmailVerification(email: string, password: string): Promise<boolean> {
  // Try to login - if it succeeds, email is verified
  // If it fails with 403, email is not verified
  try {
    const response = await safeFetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }, 10000);

    if (response.ok) {
      // Email is verified and login successful
      return true;
    }

    if (response.status === 403) {
      // Email not verified
      return false;
    }

    // Other error
    const errorDetail = await extractApiError(response);
    throw new Error(errorDetail);
  } catch (error: any) {
    // If it's a 403 error, email is not verified
    if (error.statusCode === 403 || error.userFriendlyError?.type === 'EMAIL_NOT_VERIFIED') {
      return false;
    }
    // Re-throw other errors
    throw error;
  }
}

export async function resendVerificationEmail(email: string, password: string): Promise<void> {
  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.RESEND_VERIFICATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    try {
      const errorDetail = await extractApiError(response);
      const apiError: ApiError = new Error(errorDetail);
      apiError.statusCode = response.status;
      apiError.userFriendlyError = categorizeError({
        message: errorDetail,
        response: { status: response.status },
      });
      throw apiError;
    } catch (error: any) {
      if (!error.userFriendlyError) {
        const apiError: ApiError = new Error(`Server error (${response.status})`);
        apiError.statusCode = response.status;
        apiError.userFriendlyError = categorizeError({
          message: `Server error (${response.status})`,
          response: { status: response.status },
        });
        throw apiError;
      }
      throw error;
    }
  }
}

export interface DiagnosisFeedbackRequest {
  scanId?: number;
  originalCondition: string;
  isCorrect: boolean;
  correctedCondition?: string;
  // New fields for continuous learning
  confidence?: number;
  modelType?: 'coleaf' | 'disease' | 'plant_id';
}

export interface DiagnosisFeedbackResponse {
  id: number;
  message: string;
  training_sample_saved?: boolean;
}

export async function submitDiagnosisFeedback(
  feedback: DiagnosisFeedbackRequest
): Promise<DiagnosisFeedbackResponse> {
  const { storage } = await import('../utils/storage');
  const token = await storage.getToken();

  if (!token) {
    const authError: ApiError = new Error('Authentication required');
    authError.userFriendlyError = categorizeError({ message: 'Authentication required' });
    throw authError;
  }

  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.SUBMIT_DIAGNOSIS_FEEDBACK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        scan_id: feedback.scanId,
        original_condition: feedback.originalCondition,
        is_correct: feedback.isCorrect,
        corrected_condition: feedback.correctedCondition,
        confidence: feedback.confidence,
        model_type: feedback.modelType,
      }),
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    const errorDetail = await extractApiError(response);
    const apiError: ApiError = new Error(errorDetail);
    apiError.statusCode = response.status;
    apiError.userFriendlyError = categorizeError({
      message: errorDetail,
      response: { status: response.status },
    });
    throw apiError;
  }

  let data: DiagnosisFeedbackResponse;
  try {
    data = await response.json();
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }

  return data;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  country?: string;
  userType?: string | null;
  plantTypes?: string[];
}

export async function updateUserProfile(profileData: UpdateProfileRequest): Promise<UserData> {
  const { storage } = await import('../utils/storage');
  const token = await storage.getToken();

  if (!token) {
    const authError: ApiError = new Error('Authentication required');
    authError.userFriendlyError = categorizeError({ message: 'Authentication required' });
    throw authError;
  }

  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.PROFILE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    const errorDetail = await extractApiError(response);
    const apiError: ApiError = new Error(errorDetail);
    apiError.statusCode = response.status;
    apiError.userFriendlyError = categorizeError({
      message: errorDetail,
      response: { status: response.status },
    });
    throw apiError;
  }

  let data: UserData;
  try {
    data = await response.json();
  } catch (error) {
    const parseError: ApiError = new Error('Invalid response format');
    parseError.userFriendlyError = categorizeError({ message: 'Invalid JSON response' });
    throw parseError;
  }

  return data;
}

export async function deleteAccount(token: string): Promise<void> {
  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.DELETE_ACCOUNT, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, 15000);
  } catch (error: any) {
    if (error.userFriendlyError) {
      const apiError: ApiError = new Error(error.userFriendlyError.message);
      apiError.userFriendlyError = error.userFriendlyError;
      throw apiError;
    }
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.userFriendlyError = categorizeError(error);
    throw apiError;
  }

  if (!response.ok) {
    try {
      const errorDetail = await extractApiError(response);
      const apiError: ApiError = new Error(errorDetail);
      apiError.statusCode = response.status;
      apiError.userFriendlyError = categorizeError({
        message: errorDetail,
        response: { status: response.status },
      });
      throw apiError;
    } catch (error: any) {
      if (!error.userFriendlyError) {
        const apiError: ApiError = new Error(`Failed to delete account (${response.status})`);
        apiError.statusCode = response.status;
        apiError.userFriendlyError = categorizeError({
          message: `Failed to delete account (${response.status})`,
          response: { status: response.status },
        });
        throw apiError;
      }
      throw error;
    }
  }
}