// API Error handling and utilities for Competitions module

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static from(error: any): ApiError {
    // Handle Axios errors
    if (error.response) {
      const { status, data } = error.response

      // Standard API error response
      if (data?.error) {
        return new ApiError(
          status,
          data.error.message || data.error,
          data.error.code,
          data.error.details
        )
      }

      // Generic error response
      if (data?.message) {
        return new ApiError(status, data.message)
      }

      // Array of errors (validation)
      if (Array.isArray(data)) {
        return new ApiError(status, 'Validation error', 'VALIDATION_ERROR', {
          errors: data,
        })
      }

      // Last resort - use status text
      return new ApiError(status, `HTTP Error ${status}`)
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      return new ApiError(0, 'Network connection failed', 'NETWORK_ERROR')
    }

    // Handle unknown errors
    return new ApiError(500, error.message || 'Unknown error', 'UNKNOWN_ERROR')
  }

  isValidationError(): boolean {
    return this.statusCode === 400 || this.code === 'VALIDATION_ERROR'
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401
  }

  isForbidden(): boolean {
    return this.statusCode === 403
  }

  isNotFound(): boolean {
    return this.statusCode === 404
  }

  isServerError(): boolean {
    return this.statusCode >= 500
  }

  isNetworkError(): boolean {
    return this.statusCode === 0
  }
}

export interface ErrorNotification {
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  code?: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Convert API error to user-friendly notification
 */
export function errorToNotification(error: ApiError | Error): ErrorNotification {
  if (error instanceof ApiError) {
    if (error.isValidationError()) {
      return {
        type: 'warning',
        title: 'Validation Error',
        message: error.message || 'Please check your input and try again',
        code: error.code,
      }
    }

    if (error.isUnauthorized()) {
      return {
        type: 'error',
        title: 'Unauthorized',
        message: 'Your session has expired. Please sign in again.',
        code: 'UNAUTHORIZED',
      }
    }

    if (error.isForbidden()) {
      return {
        type: 'error',
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
      }
    }

    if (error.isNotFound()) {
      return {
        type: 'warning',
        title: 'Not Found',
        message: error.message || 'The requested resource was not found.',
        code: 'NOT_FOUND',
      }
    }

    if (error.isServerError()) {
      return {
        type: 'error',
        title: 'Server Error',
        message: 'An unexpected server error occurred. Please try again later.',
        code: 'SERVER_ERROR',
      }
    }

    if (error.isNetworkError()) {
      return {
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to the server. Check your internet connection.',
        code: 'NETWORK_ERROR',
      }
    }

    return {
      type: 'error',
      title: 'Error',
      message: error.message,
      code: error.code,
    }
  }

  return {
    type: 'error',
    title: 'Unknown Error',
    message: error.message || 'An unexpected error occurred',
  }
}

/**
 * Extract validation errors from API response
 * Useful for displaying field-level errors in forms
 */
export function extractValidationErrors(
  error: ApiError
): Record<string, string[]> {
  if (!error.isValidationError() || !error.details?.errors) {
    return {}
  }

  const errors: Record<string, string[]> = {}

  if (Array.isArray(error.details.errors)) {
    error.details.errors.forEach((err: any) => {
      if (err.field && err.message) {
        if (!errors[err.field]) {
          errors[err.field] = []
        }
        errors[err.field].push(err.message)
      }
    })
  }

  return errors
}

/**
 * Retry logic for failed requests
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode < 500) {
        throw error
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }

  throw lastError
}
