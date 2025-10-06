/**
 * Supabase client configuration for server-side operations
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// Get Supabase URL and anon key from environment variables
// Try both prefixed and non-prefixed versions for compatibility
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
	console.warn('SUPABASE_ANON_KEY not set, Supabase server client will not work');
}

// Create server-side Supabase client
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false
	}
});
