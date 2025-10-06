<script lang="ts">
	import type { ResearchResult } from '$lib/research-types';
	import KeyInsightsSection from '$lib/components/KeyInsightsSection.svelte';
	import ComprehensiveReportSection from '$lib/components/ComprehensiveReportSection.svelte';
	import ReportFooter from '$lib/components/ReportFooter.svelte';
	import EmptyReportState from '$lib/components/EmptyReportState.svelte';

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
	{#if researchResult.key_insights?.critical_insights}
		<KeyInsightsSection
			criticalInsights={researchResult.key_insights.critical_insights}
			{renderMarkdown}
		/>
	{/if}

	<div class="divider divider-primary"></div>

	<ComprehensiveReportSection
		comprehensiveAnalysis={researchResult.comprehensive_report.comprehensive_analysis}
		{renderMarkdown}
	/>

	<div class="divider divider-primary mt-8"></div>

	<ReportFooter />
{:else if !isRunningResearch}
	<EmptyReportState />
{/if}
