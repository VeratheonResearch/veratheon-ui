<script lang="ts">
	import { TrendingUp } from '@lucide/svelte';

	let {
		comprehensiveAnalysis,
		renderMarkdown
	}: {
		comprehensiveAnalysis: string;
		renderMarkdown: (text: string) => string;
	} = $props();
</script>

<div class="mb-6">
	<div class="flex items-center gap-3 mb-4">
		<div class="text-secondary text-2xl">
			<TrendingUp class="w-7 h-7" />
		</div>
		<h3 class="text-xl font-bold text-secondary">Comprehensive Technical Report</h3>
		<div class="badge badge-secondary badge-lg">Technical Analysis</div>
	</div>
	<div class="text-sm text-base-content/70 mb-4">
		Exhaustive technical analysis with detailed financial calculations, methodologies, and
		quantitative findings
	</div>

	<div
		class="prose prose-lg max-w-none
					prose-headings:text-primary prose-headings:font-bold
					prose-h1:text-3xl prose-h1:border-b prose-h1:border-primary prose-h1:pb-3
					prose-h2:text-2xl prose-h2:text-secondary prose-h2:mt-8 prose-h2:mb-4
					prose-h3:text-xl prose-h3:text-accent prose-h3:mt-6 prose-h3:mb-3
					prose-p:text-base-content prose-p:leading-relaxed prose-p:mb-4
					prose-strong:text-primary prose-strong:font-semibold
					prose-ul:space-y-2 prose-ol:space-y-2
					prose-li:text-base-content
					prose-blockquote:border-l-4 prose-blockquote:border-primary
					prose-blockquote:bg-base-200 prose-blockquote:p-4 prose-blockquote:rounded-r
					prose-code:bg-base-200 prose-code:px-2 prose-code:py-1 prose-code:rounded
					prose-pre:bg-base-300 prose-pre:p-4 prose-pre:rounded-lg
					prose-table:w-full prose-table:border-collapse
					prose-th:bg-primary prose-th:text-primary-content prose-th:p-3
					prose-td:border prose-td:border-base-300 prose-td:p-3
					prose-hr:border-base-300 prose-hr:my-8"
	>
		{@html renderMarkdown(comprehensiveAnalysis)}
	</div>
</div>
