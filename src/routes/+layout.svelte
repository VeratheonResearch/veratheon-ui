<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import type { User } from '$lib/types/auth';
	import NavBar from '$lib/components/NavBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DisclaimerModal from '$lib/components/DisclaimerModal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();

	type Theme = 'light' | 'dark';
	let theme = $state<Theme>('light');
	let showDisclaimer = $state(false);
	let user = $state<User | null>(null);
	let authLoading = $state(true);

	const applyTheme = (t: Theme) => {
		// add a temporary class to animate color changes
		document.documentElement.classList.add('theme-transition');
		document.documentElement.setAttribute('data-theme', t);
		setTimeout(() => {
			document.documentElement.classList.remove('theme-transition');
		}, 500);
		try {
			localStorage.setItem('theme', t);
		} catch (e) {
			// ignore storage errors (e.g., SSR or privacy mode)
		}
	};

	const toggleTheme = () => {
		theme = theme === 'light' ? 'dark' : 'light';
		applyTheme(theme);
	};

	const acceptDisclaimer = () => {
		try {
			sessionStorage.setItem('disclaimerAccepted', 'true');
		} catch (e) {
			// ignore storage errors
		}
		showDisclaimer = false;
	};

	onMount(() => {
		// Theme setup
		let saved: Theme | null = null;
		try {
			const v = localStorage.getItem('theme');
			if (v === 'light' || v === 'dark') saved = v;
		} catch (e) {
			// ignore
		}
		if (!saved) {
			const prefersDark =
				typeof window !== 'undefined' &&
				window.matchMedia &&
				window.matchMedia('(prefers-color-scheme: dark)').matches;
			saved = prefersDark ? 'dark' : 'light';
		}
		theme = saved;
		applyTheme(theme);

		// Auth check
		const checkAuth = async () => {
			const {
				data: { user: currentUser }
			} = await supabase!.auth.getUser();

			user = currentUser;
			authLoading = false;

			// Redirect to login if not authenticated and not on login page
			const currentPath = window.location.pathname;
			if (!currentUser && currentPath !== '/login') {
				goto('/login');
			} else if (currentUser && currentPath === '/login') {
				goto('/');
			}

			// Check if disclaimer has been accepted (only for authenticated users)
			if (currentUser) {
				try {
					const accepted = sessionStorage.getItem('disclaimerAccepted');
					if (!accepted) {
						showDisclaimer = true;
					}
				} catch (e) {
					// if sessionStorage fails, show disclaimer to be safe
					showDisclaimer = true;
				}
			}
		};

		checkAuth();

		// Listen for auth state changes
		const {
			data: { subscription }
		} = supabase!.auth.onAuthStateChange((_event, session) => {
			user = session?.user || null;
			const currentPath = window.location.pathname;

			if (!session?.user && currentPath !== '/login') {
				goto('/login');
			} else if (session?.user && currentPath === '/login') {
				goto('/');
				// Show disclaimer after successful login
				try {
					const accepted = sessionStorage.getItem('disclaimerAccepted');
					if (!accepted) {
						showDisclaimer = true;
					}
				} catch (e) {
					showDisclaimer = true;
				}
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap" rel="stylesheet" />
</svelte:head>

{#if authLoading}
	<LoadingSpinner />
{:else}
	<div class="flex min-h-dvh flex-col bg-base-200">
		{#if user}
			<NavBar {user} {theme} onToggleTheme={toggleTheme} />
		{/if}

		<main class="container mx-auto w-full flex-1 px-1 md:px-4 py-2 md:py-6">
			{@render children?.()}
		</main>

		{#if user}
			<Footer />
		{/if}
	</div>
{/if}

<DisclaimerModal isOpen={showDisclaimer} onAccept={acceptDisclaimer} />

<!-- Toast Notification Container -->
<Toaster position="top-right" richColors closeButton />
