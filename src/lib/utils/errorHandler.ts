/**
 * Error handling utilities for the Veratheon Research platform
 */

import { ErrorCode, type ApiErrorResponse, type UserErrorInfo, type ErrorMapping } from '$lib/types/errors';
import { toast } from 'svelte-sonner';

// Re-export ErrorCode for convenience
export { ErrorCode } from '$lib/types/errors';

/**
 * Error code to user-friendly message mapping
 */
const ERROR_MAPPINGS: Record<ErrorCode, ErrorMapping> = {
	[ErrorCode.RATE_LIMIT_EXCEEDED]: {
		title: 'Rate Limit Reached',
		message: 'Alpha Vantage API rate limit reached. Please try again in 1 minute.',
		retryable: true
	},
	[ErrorCode.INVALID_TICKER]: {
		title: 'Invalid Symbol',
		message: 'The ticker symbol format is invalid. Please check and try again.',
		retryable: true
	},
	[ErrorCode.TICKER_NOT_FOUND]: {
		title: 'Symbol Not Found',
		message: 'Symbol not found. Check spelling or try a different ticker.',
		retryable: true
	},
	[ErrorCode.MODEL_TIMEOUT]: {
		title: 'Analysis Timeout',
		message: 'Analysis took too long to complete. Try again or select a faster model.',
		retryable: true
	},
	[ErrorCode.MODEL_ERROR]: {
		title: 'AI Model Error',
		message: 'The AI model encountered an error. Please try again.',
		retryable: true
	},
	[ErrorCode.PROCESSING_ERROR]: {
		title: 'Processing Error',
		message: 'An error occurred while processing your request. Please try again.',
		retryable: true
	},
	[ErrorCode.NETWORK_ERROR]: {
		title: 'Connection Lost',
		message: 'Network connection lost. Check your internet and try again.',
		retryable: true
	},
	[ErrorCode.SERVICE_UNAVAILABLE]: {
		title: 'Service Unavailable',
		message: 'The service is temporarily unavailable. Please try again later.',
		retryable: true
	},
	[ErrorCode.TIMEOUT]: {
		title: 'Request Timeout',
		message: 'The request timed out. Please try again.',
		retryable: true
	},
	[ErrorCode.DATA_FETCH_ERROR]: {
		title: 'Data Fetch Failed',
		message: 'Failed to fetch data from external source. Please try again.',
		retryable: true
	},
	[ErrorCode.INVALID_DATA]: {
		title: 'Invalid Data',
		message: 'The data received is invalid or corrupted. Please try again.',
		retryable: true
	},
	[ErrorCode.JOB_NOT_FOUND]: {
		title: 'Job Not Found',
		message: 'The requested research job could not be found.',
		retryable: false
	},
	[ErrorCode.JOB_FAILED]: {
		title: 'Research Failed',
		message: 'The research job failed to complete. Please try again.',
		retryable: true
	},
	[ErrorCode.UNKNOWN_ERROR]: {
		title: 'Unexpected Error',
		message: 'An unexpected error occurred. Please try again or contact support.',
		retryable: true
	}
};

/**
 * Parse an API error response and return user-friendly error info
 */
export function parseApiError(error: unknown): UserErrorInfo {
	// Check if it's a standardized API error response
	if (isApiErrorResponse(error)) {
		const errorCode = error.error.code;
		const mapping = ERROR_MAPPINGS[errorCode] || ERROR_MAPPINGS[ErrorCode.UNKNOWN_ERROR];

		return {
			title: mapping.title,
			message: error.error.user_message || mapping.message,
			retryable: mapping.retryable,
			retry_after: error.error.retry_after,
			support_code: error.error.support_code
		};
	}

	// Check if it's a fetch/network error
	if (error instanceof TypeError && error.message.includes('fetch')) {
		const mapping = ERROR_MAPPINGS[ErrorCode.NETWORK_ERROR];
		return {
			title: mapping.title,
			message: mapping.message,
			retryable: mapping.retryable
		};
	}

	// Check if it's a standard Error object
	if (error instanceof Error) {
		// Try to detect specific error patterns
		const message = error.message.toLowerCase();

		if (message.includes('timeout')) {
			const mapping = ERROR_MAPPINGS[ErrorCode.TIMEOUT];
			return {
				title: mapping.title,
				message: mapping.message,
				retryable: mapping.retryable
			};
		}

		if (message.includes('rate limit')) {
			const mapping = ERROR_MAPPINGS[ErrorCode.RATE_LIMIT_EXCEEDED];
			return {
				title: mapping.title,
				message: mapping.message,
				retryable: mapping.retryable,
				retry_after: 60 // Default 1 minute
			};
		}

		if (message.includes('not found') || message.includes('404')) {
			const mapping = ERROR_MAPPINGS[ErrorCode.TICKER_NOT_FOUND];
			return {
				title: mapping.title,
				message: mapping.message,
				retryable: mapping.retryable
			};
		}

		// Generic error with original message
		return {
			title: 'Error',
			message: error.message,
			retryable: true
		};
	}

	// Fallback for unknown errors
	const mapping = ERROR_MAPPINGS[ErrorCode.UNKNOWN_ERROR];
	return {
		title: mapping.title,
		message: mapping.message,
		retryable: mapping.retryable
	};
}

/**
 * Type guard to check if an error is a standardized API error response
 */
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
	return (
		typeof error === 'object' &&
		error !== null &&
		'error' in error &&
		typeof (error as ApiErrorResponse).error === 'object' &&
		(error as ApiErrorResponse).error !== null &&
		'code' in (error as ApiErrorResponse).error &&
		'message' in (error as ApiErrorResponse).error
	);
}

/**
 * Handle an API error and show appropriate toast notification
 */
export function handleApiError(error: unknown, onRetry?: () => void): UserErrorInfo {
	const errorInfo = parseApiError(error);

	// Log technical details to console for debugging
	console.error('API Error:', error);
	console.error('Parsed Error Info:', errorInfo);

	// Show error toast
	const toastMessage = errorInfo.support_code
		? `${errorInfo.message}\n\nSupport Code: ${errorInfo.support_code}`
		: errorInfo.message;

	if (errorInfo.retryable && onRetry) {
		toast.error(toastMessage, {
			action: {
				label: errorInfo.retry_after ? `Retry in ${errorInfo.retry_after}s` : 'Retry',
				onClick: onRetry
			},
			duration: 10000 // Show for 10 seconds for retryable errors
		});
	} else {
		toast.error(toastMessage, {
			duration: 8000
		});
	}

	return errorInfo;
}

/**
 * Create a standardized API error response
 * (Used by frontend API endpoints)
 */
export function createApiError(
	code: ErrorCode,
	message: string,
	userMessage?: string,
	retryAfter?: number,
	details?: Record<string, unknown>
): ApiErrorResponse {
	const mapping = ERROR_MAPPINGS[code] || ERROR_MAPPINGS[ErrorCode.UNKNOWN_ERROR];

	return {
		error: {
			code,
			message,
			user_message: userMessage || mapping.message,
			retry_after: retryAfter,
			support_code: generateSupportCode(),
			details
		}
	};
}

/**
 * Generate a unique support code for error tracking
 */
function generateSupportCode(): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substring(2, 7);
	return `ERR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Extract error from response body
 */
export async function extractErrorFromResponse(response: Response): Promise<unknown> {
	try {
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return await response.json();
		}
		return { error: await response.text() };
	} catch {
		return { error: response.statusText || 'Unknown error' };
	}
}
