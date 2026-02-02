import { json } from '@sveltejs/kit';
import { API_URL } from '$lib/config';
import { createApiError, ErrorCode } from '$lib/utils/errorHandler';

export async function POST({ request }) {
  try {
    const { symbol } = await request.json();

    if (!symbol || typeof symbol !== 'string') {
      const errorResponse = createApiError(
        ErrorCode.INVALID_TICKER,
        'Invalid symbol provided',
        'Please enter a valid stock symbol.'
      );
      return json(errorResponse, { status: 400 });
    }

    const symbolUpper = symbol.trim().toUpperCase();

    // Call FastAPI backend to start research job
    const response = await fetch(`${API_URL}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: symbolUpper
      })
    });

    // If response is not ok, try to parse error from backend
    if (!response.ok) {
      try {
        const errorData = await response.json();
        // If backend already returned standardized error, forward it
        if (errorData.error) {
          return json(errorData, { status: response.status });
        }
      } catch {
        // If parsing fails, create generic error
      }

      // Fallback to generic error if backend didn't provide standardized format
      const errorResponse = createApiError(
        ErrorCode.PROCESSING_ERROR,
        `Backend returned ${response.status}: ${response.statusText}`,
        'Failed to start research. Please try again.'
      );
      return json(errorResponse, { status: response.status });
    }

    const result = await response.json();

    return json({
      success: true,
      job_id: result.job_id,
      message: result.message,
      symbol: symbolUpper
    });

  } catch (error) {
    console.error('Start research endpoint error:', error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const errorResponse = createApiError(
        ErrorCode.NETWORK_ERROR,
        error.message,
        'Connection lost. Check your internet and try again.'
      );
      return json(errorResponse, { status: 503 });
    }

    // Generic error fallback
    const errorResponse = createApiError(
      ErrorCode.UNKNOWN_ERROR,
      error.message || 'Unknown error occurred',
      'An unexpected error occurred. Please try again.'
    );
    return json(errorResponse, { status: 500 });
  }
}