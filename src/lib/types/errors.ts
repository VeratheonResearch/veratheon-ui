/**
 * Standardized error types for the Veratheon Research platform
 */

/**
 * Error codes returned by the backend
 */
export enum ErrorCode {
	// API errors
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
	INVALID_TICKER = 'INVALID_TICKER',
	TICKER_NOT_FOUND = 'TICKER_NOT_FOUND',

	// Model/processing errors
	MODEL_TIMEOUT = 'MODEL_TIMEOUT',
	MODEL_ERROR = 'MODEL_ERROR',
	PROCESSING_ERROR = 'PROCESSING_ERROR',

	// Network errors
	NETWORK_ERROR = 'NETWORK_ERROR',
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
	TIMEOUT = 'TIMEOUT',

	// Data errors
	DATA_FETCH_ERROR = 'DATA_FETCH_ERROR',
	INVALID_DATA = 'INVALID_DATA',

	// Job errors
	JOB_NOT_FOUND = 'JOB_NOT_FOUND',
	JOB_FAILED = 'JOB_FAILED',

	// Unknown/generic errors
	UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Standardized error response from backend
 */
export interface ApiErrorResponse {
	error: {
		code: ErrorCode;
		message: string;
		user_message: string;
		retry_after?: number; // seconds until retry is allowed
		support_code?: string; // reference code for support
		details?: Record<string, unknown>; // additional context
	};
}

/**
 * User-friendly error information for display
 */
export interface UserErrorInfo {
	title: string;
	message: string;
	retryable: boolean;
	retry_after?: number; // seconds
	support_code?: string;
	action?: {
		label: string;
		callback: () => void;
	};
}

/**
 * Error mapping configuration
 */
export interface ErrorMapping {
	title: string;
	message: string;
	retryable: boolean;
}
