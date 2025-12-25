import { API_ENDPOINTS } from '../config/api';
import { extractApiError, categorizeError, UserFriendlyError } from '../utils/errorHandler';

export interface PlantIdentificationResult {
  plant_name: string;
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
}

export interface AuthResponse {
  access_token: string;
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

/**
 * Safe fetch with timeout and error handling
 */
async function safeFetch(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  try {
    const fetchPromise = fetch(url, options);
    const timeoutPromise = createTimeoutPromise(timeoutMs);
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response) {
      throw new Error('No response received');
    }
    
    return response;
  } catch (error: any) {
    // Re-throw with enhanced error info
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

export async function identifyPlant(imageUri: string, deviceId: string): Promise<PlantIdentificationResult> {
  const formData = new FormData();

  // Append file with proper image/jpeg content type
  formData.append('file', {
    uri: imageUri,
    name: 'plant.jpg',
    type: 'image/jpeg',
  } as any);

  // Append device_id as form field
  formData.append('device_id', deviceId);

  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.IDENTIFY, {
    method: 'POST',
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
}

export async function diagnosePlant(imageUri: string, deviceId: string): Promise<DiagnosisResult> {
  const formData = new FormData();

  // Append file with proper image/jpeg content type
  formData.append('file', {
    uri: imageUri,
    name: 'plant.jpg',
    type: 'image/jpeg',
  } as any);

  // Append device_id as form field
  formData.append('device_id', deviceId);

  let response: Response;
  try {
    response = await safeFetch(API_ENDPOINTS.DIAGNOSE, {
    method: 'POST',
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
  let rawData: any;
  try {
    rawData = await response.json();
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
    const diagnosisError: ApiError = new Error(rawData.message || 'Diagnosis failed');
    diagnosisError.userFriendlyError = categorizeError({
      message: rawData.message || 'Unable to diagnose the plant. Please try again with a clearer image.'
    });
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
  };

  return data;
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