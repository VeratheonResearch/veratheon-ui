/**
 * Toast notification utilities
 * Wraps svelte-sonner for easier usage across the application
 */

import { toast as sonnerToast } from 'svelte-sonner';

/**
 * Display a success toast notification
 * @param message - The message to display
 * @param options - Optional configuration
 */
export function showSuccess(message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) {
	return sonnerToast.success(message, {
		duration: options?.duration ?? 5000,
		action: options?.action
	});
}

/**
 * Display an error toast notification
 * @param message - The error message to display
 * @param options - Optional configuration
 */
export function showError(message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) {
	return sonnerToast.error(message, {
		duration: options?.duration ?? 5000,
		action: options?.action
	});
}

/**
 * Display a warning toast notification
 * @param message - The warning message to display
 * @param options - Optional configuration
 */
export function showWarning(message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) {
	return sonnerToast.warning(message, {
		duration: options?.duration ?? 5000,
		action: options?.action
	});
}

/**
 * Display an info toast notification
 * @param message - The info message to display
 * @param options - Optional configuration
 */
export function showInfo(message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) {
	return sonnerToast.info(message, {
		duration: options?.duration ?? 5000,
		action: options?.action
	});
}

/**
 * Display a loading toast notification
 * Returns an ID that can be used to update or dismiss the toast
 * @param message - The loading message to display
 */
export function showLoading(message: string) {
	return sonnerToast.loading(message);
}

/**
 * Dismiss a toast by ID
 * @param toastId - The ID of the toast to dismiss
 */
export function dismissToast(toastId: string | number) {
	sonnerToast.dismiss(toastId);
}

/**
 * Promise toast - shows loading, then success or error based on promise result
 * @param promise - The promise to track
 * @param messages - Messages for different states
 */
export function showPromise<T>(
	promise: Promise<T>,
	messages: {
		loading: string;
		success: string | ((data: T) => string);
		error: string | ((error: any) => string);
	}
) {
	return sonnerToast.promise(promise, messages);
}
