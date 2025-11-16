/**
 * Supabase client configuration for frontend
 */

import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Get Supabase URL and anon key from environment variables
// Use VITE_ prefix for browser-accessible variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client (only in browser)
export const supabase = browser
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true
			},
			realtime: {
				params: {
					eventsPerSecond: 10
				},
				// Enable automatic reconnection
				heartbeatIntervalMs: 30000, // Send heartbeat every 30s
				reconnectAfterMs: (tries: number) => {
					// Exponential backoff with jitter: 1s, 2s, 4s, 8s, max 10s
					const baseDelay = Math.min(1000 * Math.pow(2, tries), 10000);
					const jitter = Math.random() * 1000; // Add up to 1s jitter
					return baseDelay + jitter;
				}
			}
		})
	: null;
