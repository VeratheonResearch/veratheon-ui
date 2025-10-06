<script lang="ts">
	import { page } from '$app/stores';
	import { Home, TrendingUp, Clock } from '@lucide/svelte';
</script>

<ul class="hidden md:flex space-x-2 mx-4">
	<li>
		<a
			href="/"
			class="btn btn-ghost gap-2 {$page.url.pathname === '/' ? 'btn-active' : ''}"
		>
			<Home class="w-4 h-4" />
			Home
		</a>
	</li>
	<li>
		<a
			href="/trades"
			class="btn btn-ghost gap-2 {$page.url.pathname === '/trades' ? 'btn-active' : ''}"
		>
			<TrendingUp class="w-4 h-4" />
			Trades
		</a>
	</li>
	<li>
		<a
			href="/history"
			class="btn btn-ghost gap-2 {$page.url.pathname === '/history' ? 'btn-active' : ''}"
		>
			<Clock class="w-4 h-4" />
			History
		</a>
	</li>
</ul>
