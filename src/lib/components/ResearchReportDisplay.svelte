<script lang="ts">
	import { Lightbulb, TrendingUp } from '@lucide/svelte';
	import type { ResearchResult } from '$lib/research-types';

	let {
		researchResult,
		isRunningResearch,
		stockSymbol,
		renderMarkdown
	}: {
		researchResult: ResearchResult | null;
		isRunningResearch: boolean;
		stockSymbol: string;
		renderMarkdown: (text: string) => string;
	} = $props();
</script>

{#if researchResult?.comprehensive_report?.comprehensive_analysis}
	<!-- Key Insights Section - Prominent display at top -->
	{#if researchResult.key_insights?.critical_insights}
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
				{@html renderMarkdown(researchResult.key_insights.critical_insights)}
			</div>
		</div>
	{/if}

	<div class="divider divider-primary"></div>

	<!-- Comprehensive Technical Analysis Section -->
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
			{@html renderMarkdown(researchResult.comprehensive_report.comprehensive_analysis)}
		</div>
	</div>

	<div class="divider divider-primary mt-8"></div>

	<!-- Report Footer -->
	<div class="flex justify-between items-center text-sm text-base-content/70 mt-4">
		<div class="flex items-center gap-2">
			<div class="badge badge-outline badge-sm">AI Generated</div>
			<div class="badge badge-outline badge-sm">Veratheon Research</div>
		</div>
		<div>
			Generated: {new Date().toLocaleString()}
		</div>
	</div>
{:else if !isRunningResearch}
	<!-- Fallback when no report is available -->
	<div class="text-center py-12">
		<div class="text-6xl mb-4">
			<TrendingUp class="w-16 h-16 mx-auto text-primary" />
		</div>
		<h3 class="text-xl font-semibold mb-2">Research Complete</h3>
		<p class="text-base-content/70">
			Research analysis completed but comprehensive report is not available.
		</p>
	</div>
{/if}
