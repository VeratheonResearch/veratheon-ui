<script lang="ts">
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import DesktopNav from '$lib/components/DesktopNav.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';
	import GitHubLink from '$lib/components/GitHubLink.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import type { User } from '$lib/types/auth';

	let { user, theme, onToggleTheme }: { user: User | null; theme: 'light' | 'dark'; onToggleTheme: () => void } = $props();

	let mobileMenuOpen = $state(false);

	const toggleMobileMenu = () => {
		mobileMenuOpen = !mobileMenuOpen;
	};
</script>

<div class="bg-base-100 shadow">
	<div class="container mx-auto px-4">
		<div class="flex justify-between items-center h-16">
			<!-- Left: Title/Brand -->
			<div>
				<a class="text-xl font-bold" href="/" style="font-family: 'Major Mono Display', monospace;">Veratheon</a>
			</div>

			<!-- Middle: Navigation (desktop only) -->
			<DesktopNav />

			<!-- Right: Theme Toggle + GitHub + User Avatar + Mobile Menu -->
			<div class="flex items-center gap-2">
				<ThemeToggle {theme} onToggle={onToggleTheme} />
				<GitHubLink />

				<!-- User Avatar (desktop) -->
				<div class="hidden md:block">
					<UserAvatar {user} />
				</div>

				<!-- Mobile Menu -->
				<MobileMenu isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} />
			</div>
		</div>
	</div>
</div>
