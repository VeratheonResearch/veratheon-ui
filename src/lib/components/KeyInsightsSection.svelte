<script lang="ts">
	import { Lightbulb } from '@lucide/svelte';

	let {
		criticalInsights,
		renderMarkdown
	}: {
		criticalInsights: string;
		renderMarkdown: (text: string) => string;
	} = $props();
</script>

<div
	class="bg-gradient-to-r from-primary/15 to-secondary/15 rounded-xl p-8 border-2 border-primary/30 shadow-lg mb-8"
>
	<div class="flex items-center gap-4 mb-6">
		<div class="text-primary text-3xl">
			<Lightbulb class="w-8 h-8" />
		</div>
		<h3 class="text-2xl font-bold text-primary">Key Investment Insights</h3>
		<div class="badge badge-primary badge-lg">Investment Summary</div>
	</div>

	<div
		class="prose prose-lg max-w-none
					prose-headings:text-primary prose-headings:font-bold
					prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
					prose-p:text-base-content prose-p:leading-relaxed prose-p:mb-4
					prose-strong:text-primary prose-strong:font-semibold
					prose-ol:space-y-3 prose-ul:space-y-3
					prose-li:text-base-content prose-li:leading-relaxed prose-li:mb-2
					prose-code:bg-primary/10 prose-code:px-2 prose-code:py-1 prose-code:rounded
					prose-blockquote:border-l-4 prose-blockquote:border-primary
					prose-blockquote:bg-primary/5 prose-blockquote:p-4 prose-blockquote:rounded-r"
	>
		{@html renderMarkdown(criticalInsights)}
	</div>
</div>
