<script lang="ts" module>
	// Module-level shared state (shared across all component instances)
	let isScrolling = false;
	let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { List, ChevronDown, ChevronUp, Maximize2, Minimize2 } from '@lucide/svelte';

	interface TocSection {
		id: string;
		title: string;
		icon?: string;
		colorClass?: string;
	}

	let {
		sections,
		activeSection = $bindable('synthesis'),
		allExpanded = $bindable(false),
		onExpandAll,
		onCollapseAll,
		onSectionClick
	}: {
		sections: TocSection[];
		activeSection?: string;
		allExpanded?: boolean;
		onExpandAll: () => void;
		onCollapseAll: () => void;
		onSectionClick?: (sectionId: string) => void;
	} = $props();

	let isMobileOpen = $state(false);
	let observers: IntersectionObserver[] = [];

	function scrollToSection(sectionId: string) {
		// Cancel any pending scroll
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}

		// Immediately update active section for visual feedback
		activeSection = sectionId;

		// Pause observer tracking during programmatic scroll
		isScrolling = true;

		// Expand the section if callback provided
		onSectionClick?.(sectionId);

		// Close mobile dropdown after selection
		isMobileOpen = false;

		// Use requestAnimationFrame to wait for DOM update, then scroll
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const element = document.getElementById(sectionId);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}

				// Re-enable observer after scroll completes (estimate ~500ms for smooth scroll)
				scrollTimeout = setTimeout(() => {
					isScrolling = false;
				}, 600);
			});
		});
	}

	function setupScrollTracking() {
		// Clean up existing observers
		observers.forEach(obs => obs.disconnect());
		observers = [];

		const options = {
			root: null,
			rootMargin: '-20% 0px -60% 0px',
			threshold: 0
		};

		sections.forEach(section => {
			const element = document.getElementById(section.id);
			if (element) {
				const observer = new IntersectionObserver((entries) => {
					// Skip updates during programmatic scrolling
					if (isScrolling) return;

					entries.forEach(entry => {
						if (entry.isIntersecting) {
							activeSection = section.id;
						}
					});
				}, options);
				observer.observe(element);
				observers.push(observer);
			}
		});
	}

	onMount(() => {
		// Delay setup to ensure DOM is ready
		setTimeout(setupScrollTracking, 100);
	});

	onDestroy(() => {
		observers.forEach(obs => obs.disconnect());
	});
</script>

<!-- Desktop TOC Sidebar -->
<aside class="hidden lg:block sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
	<div class="bg-base-200 rounded-lg p-4 border border-base-300 shadow-sm">
		<div class="flex items-center justify-between mb-4">
			<h4 class="font-semibold text-sm flex items-center gap-2 text-base-content">
				<List class="w-4 h-4" />
				Contents
			</h4>
			<div class="flex gap-1">
				<button
					class="btn btn-ghost btn-xs tooltip tooltip-left"
					data-tip="Expand All"
					onclick={onExpandAll}
				>
					<Maximize2 class="w-3.5 h-3.5" />
				</button>
				<button
					class="btn btn-ghost btn-xs tooltip tooltip-left"
					data-tip="Collapse All"
					onclick={onCollapseAll}
				>
					<Minimize2 class="w-3.5 h-3.5" />
				</button>
			</div>
		</div>
		<nav class="space-y-1">
			{#each sections as section}
				<button
					class="w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2
						{activeSection === section.id
							? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
							: 'text-base-content/70 hover:bg-base-300 hover:text-base-content'}"
					onclick={() => scrollToSection(section.id)}
				>
					<span class="w-1.5 h-1.5 rounded-full {activeSection === section.id ? 'bg-primary' : 'bg-base-content/30'}"></span>
					{section.title}
				</button>
			{/each}
		</nav>
	</div>
</aside>

<!-- Mobile TOC Dropdown -->
<div class="lg:hidden mb-4">
	<div class="bg-base-200 rounded-lg border border-base-300 shadow-sm">
		<div class="flex items-center justify-between p-3">
			<!-- Toggle button for dropdown -->
			<button
				class="flex items-center gap-2 flex-1"
				onclick={() => isMobileOpen = !isMobileOpen}
			>
				<List class="w-4 h-4 text-base-content/70" />
				<span class="font-medium text-sm">Jump to Section</span>
				{#if isMobileOpen}
					<ChevronUp class="w-4 h-4 text-base-content/60" />
				{:else}
					<ChevronDown class="w-4 h-4 text-base-content/60" />
				{/if}
			</button>
			<!-- Expand/Collapse buttons (separate from toggle) -->
			<div class="flex gap-1">
				<button
					class="btn btn-ghost btn-xs"
					onclick={onExpandAll}
					aria-label="Expand all sections"
				>
					<Maximize2 class="w-3.5 h-3.5" />
				</button>
				<button
					class="btn btn-ghost btn-xs"
					onclick={onCollapseAll}
					aria-label="Collapse all sections"
				>
					<Minimize2 class="w-3.5 h-3.5" />
				</button>
			</div>
		</div>

		{#if isMobileOpen}
			<nav class="border-t border-base-300 p-2">
				{#each sections as section}
					<button
						class="w-full text-left px-3 py-2.5 text-sm rounded-md transition-all duration-200 flex items-center gap-2
							{activeSection === section.id
								? 'bg-primary/10 text-primary font-medium'
								: 'text-base-content/70 hover:bg-base-300 hover:text-base-content'}"
						onclick={() => scrollToSection(section.id)}
					>
						<span class="w-1.5 h-1.5 rounded-full {activeSection === section.id ? 'bg-primary' : 'bg-base-content/30'}"></span>
						{section.title}
					</button>
				{/each}
			</nav>
		{/if}
	</div>
</div>
