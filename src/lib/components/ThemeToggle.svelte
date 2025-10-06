<script lang="ts">
	let { theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void } = $props();
</script>

<button
	class="p-2 rounded-full hover:bg-base-200"
	aria-label="Toggle theme"
	onclick={onToggle}
>
	{#if theme === 'dark'}
		<!-- Sun icon for light mode -->
		<svg
			class="h-5 w-5"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="5"></circle>
			<path
				d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
			></path>
		</svg>
	{:else}
		<!-- Moon icon for dark mode -->
		<svg
			class="h-5 w-5 fill-current"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
		</svg>
	{/if}
</button>
