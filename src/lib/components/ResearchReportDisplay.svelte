<script lang="ts">
	import type { WorkflowResult } from '$lib/research-types';
	import ReportFooter from '$lib/components/ReportFooter.svelte';
	import EmptyReportState from '$lib/components/EmptyReportState.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { TrendingUp, Lightbulb, BarChart3, Newspaper, Globe } from '@lucide/svelte';

	let {
		researchResult,
		isRunningResearch,
		stockSymbol,
		renderMarkdown
	}: {
		researchResult: WorkflowResult | null;
		isRunningResearch: boolean;
		stockSymbol: string;
		renderMarkdown: (text: string) => string;
	} = $props();

	// Track which sections are expanded (Set for multiple sections)
	let expandedSections = $state(new Set<string>(['synthesis']));
	let activeSection = $state('synthesis');

	// Define TOC sections based on available report data
	let tocSections = $derived.by(() => {
		const sections: Array<{ id: string; title: string }> = [];

		if (researchResult?.synthesis_report) {
			sections.push({ id: 'synthesis', title: 'Investment Synthesis' });
		}
		if (researchResult?.trade_advice) {
			sections.push({ id: 'trade', title: 'Trade Ideas' });
		}
		if (researchResult?.quantitative_report) {
			sections.push({ id: 'quantitative', title: 'Quantitative Analysis' });
		}
		if (researchResult?.qualitative_report) {
			sections.push({ id: 'qualitative', title: 'Qualitative Analysis' });
		}
		if (researchResult?.macro_report) {
			sections.push({ id: 'macro', title: 'Macro Economic Context' });
		}

		return sections;
	});

	function toggleSection(section: string) {
		const newSet = new Set(expandedSections);
		if (newSet.has(section)) {
			newSet.delete(section);
		} else {
			newSet.add(section);
		}
		expandedSections = newSet;
	}

	function isSectionExpanded(section: string): boolean {
		return expandedSections.has(section);
	}

	function expandAll() {
		expandedSections = new Set(tocSections.map(s => s.id));
	}

	function collapseAll() {
		expandedSections = new Set();
	}

	function expandSection(sectionId: string) {
		if (!expandedSections.has(sectionId)) {
			const newSet = new Set(expandedSections);
			newSet.add(sectionId);
			expandedSections = newSet;
		}
	}

	// Check if all sections are expanded
	let allExpanded = $derived(
		tocSections.length > 0 && tocSections.every(s => expandedSections.has(s.id))
	);
</script>

<style>
	/* Scroll offset for smooth scrolling with fixed header */
	.report-section {
		scroll-margin-top: 5rem;
	}
</style>

{#if researchResult?.synthesis_report}
	<!-- Mobile TOC (shows above content) -->
	<div class="lg:hidden">
		<TableOfContents
			sections={tocSections}
			bind:activeSection
			{allExpanded}
			onExpandAll={expandAll}
			onCollapseAll={collapseAll}
			onSectionClick={expandSection}
		/>
	</div>

	<!-- Main content with desktop TOC sidebar -->
	<div class="flex gap-6">
		<!-- Desktop TOC Sidebar -->
		<div class="hidden lg:block w-52 flex-shrink-0">
			<TableOfContents
				sections={tocSections}
				bind:activeSection
				{allExpanded}
				onExpandAll={expandAll}
				onCollapseAll={collapseAll}
				onSectionClick={expandSection}
			/>
		</div>

		<!-- Report Content -->
		<div class="flex-1 min-w-0">
			<!-- Synthesis Report (Main) -->
			<div id="synthesis" class="mb-6 report-section">
				<button
					class="flex items-center justify-between w-full text-left"
					onclick={() => toggleSection('synthesis')}
				>
					<h3 class="text-lg md:text-xl font-bold text-primary flex items-center gap-2">
						<TrendingUp class="w-6 h-6" />
						Investment Synthesis
					</h3>
					<span class="text-base-content/60">{isSectionExpanded('synthesis') ? '▼' : '▶'}</span>
				</button>
				{#if isSectionExpanded('synthesis')}
					<div class="mt-4 prose prose-sm md:prose-base max-w-none">
						{@html renderMarkdown(researchResult.synthesis_report)}
					</div>
				{/if}
			</div>

			<div class="divider divider-primary"></div>

			<!-- Trade Advice (with disclaimer styling) -->
			{#if researchResult.trade_advice}
				<div id="trade" class="mb-6 report-section">
					<button
						class="flex items-center justify-between w-full text-left"
						onclick={() => toggleSection('trade')}
					>
						<h3 class="text-lg md:text-xl font-bold text-warning flex items-center gap-2">
							<Lightbulb class="w-6 h-6" />
							Trade Ideas
							<span class="badge badge-warning badge-sm">Advisory Only</span>
						</h3>
						<span class="text-base-content/60">{isSectionExpanded('trade') ? '▼' : '▶'}</span>
					</button>
					{#if isSectionExpanded('trade')}
						<div class="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
							<div class="prose prose-sm md:prose-base max-w-none">
								{@html renderMarkdown(researchResult.trade_advice)}
							</div>
						</div>
					{/if}
				</div>

				<div class="divider"></div>
			{/if}

			<!-- Quantitative Analysis -->
			{#if researchResult.quantitative_report}
				<div id="quantitative" class="mb-6 report-section">
					<button
						class="flex items-center justify-between w-full text-left"
						onclick={() => toggleSection('quantitative')}
					>
						<h3 class="text-lg md:text-xl font-bold text-secondary flex items-center gap-2">
							<BarChart3 class="w-6 h-6" />
							Quantitative Analysis
						</h3>
						<span class="text-base-content/60">{isSectionExpanded('quantitative') ? '▼' : '▶'}</span>
					</button>
					{#if isSectionExpanded('quantitative')}
						<div class="mt-4 prose prose-sm md:prose-base max-w-none">
							{@html renderMarkdown(researchResult.quantitative_report)}
						</div>
					{/if}
				</div>

				<div class="divider"></div>
			{/if}

			<!-- Qualitative Analysis -->
			{#if researchResult.qualitative_report}
				<div id="qualitative" class="mb-6 report-section">
					<button
						class="flex items-center justify-between w-full text-left"
						onclick={() => toggleSection('qualitative')}
					>
						<h3 class="text-lg md:text-xl font-bold text-accent flex items-center gap-2">
							<Newspaper class="w-6 h-6" />
							Qualitative Analysis
						</h3>
						<span class="text-base-content/60">{isSectionExpanded('qualitative') ? '▼' : '▶'}</span>
					</button>
					{#if isSectionExpanded('qualitative')}
						<div class="mt-4 prose prose-sm md:prose-base max-w-none">
							{@html renderMarkdown(researchResult.qualitative_report)}
						</div>
					{/if}
				</div>

				<div class="divider"></div>
			{/if}

			<!-- Macro Economic Context -->
			{#if researchResult.macro_report}
				<div id="macro" class="mb-6 report-section">
					<button
						class="flex items-center justify-between w-full text-left"
						onclick={() => toggleSection('macro')}
					>
						<h3 class="text-lg md:text-xl font-bold text-info flex items-center gap-2">
							<Globe class="w-6 h-6" />
							Macro Economic Context
						</h3>
						<span class="text-base-content/60">{isSectionExpanded('macro') ? '▼' : '▶'}</span>
					</button>
					{#if isSectionExpanded('macro')}
						<div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<!-- Inflation -->
							{#if researchResult.macro_report.inflation}
								<div class="card bg-base-200 p-4">
									<h4 class="font-semibold text-sm mb-2">Inflation</h4>
									{#if researchResult.macro_report.inflation.cpi}
										<p class="text-xs">CPI: {researchResult.macro_report.inflation.cpi.value || 'N/A'}</p>
									{/if}
									{#if researchResult.macro_report.inflation.inflation_rate}
										<p class="text-xs">Rate: {researchResult.macro_report.inflation.inflation_rate.value || 'N/A'}%</p>
										{#if researchResult.macro_report.inflation.inflation_rate.context}
											<p class="text-xs text-base-content/60">{researchResult.macro_report.inflation.inflation_rate.context}</p>
										{/if}
									{/if}
								</div>
							{/if}

							<!-- Employment -->
							{#if researchResult.macro_report.employment}
								<div class="card bg-base-200 p-4">
									<h4 class="font-semibold text-sm mb-2">Employment</h4>
									{#if researchResult.macro_report.employment.unemployment_rate}
										<p class="text-xs">Unemployment: {researchResult.macro_report.employment.unemployment_rate.value || 'N/A'}%</p>
									{/if}
									{#if researchResult.macro_report.employment.nonfarm_payroll}
										<p class="text-xs">Payrolls: {researchResult.macro_report.employment.nonfarm_payroll.value || 'N/A'}</p>
									{/if}
								</div>
							{/if}

							<!-- Interest Rates -->
							{#if researchResult.macro_report.interest_rates}
								<div class="card bg-base-200 p-4">
									<h4 class="font-semibold text-sm mb-2">Interest Rates</h4>
									{#if researchResult.macro_report.interest_rates.fed_funds_rate}
										<p class="text-xs">Fed Funds: {researchResult.macro_report.interest_rates.fed_funds_rate.value || 'N/A'}%</p>
									{/if}
									{#if researchResult.macro_report.interest_rates.treasury_10y}
										<p class="text-xs">10Y Treasury: {researchResult.macro_report.interest_rates.treasury_10y.value || 'N/A'}%</p>
									{/if}
									{#if researchResult.macro_report.interest_rates.treasury_2y}
										<p class="text-xs">2Y Treasury: {researchResult.macro_report.interest_rates.treasury_2y.value || 'N/A'}%</p>
									{/if}
								</div>
							{/if}

							<!-- Growth -->
							{#if researchResult.macro_report.growth?.real_gdp}
								<div class="card bg-base-200 p-4">
									<h4 class="font-semibold text-sm mb-2">Growth</h4>
									<p class="text-xs">Real GDP: ${researchResult.macro_report.growth.real_gdp.value || 'N/A'}B</p>
									{#if researchResult.macro_report.growth.real_gdp.context}
										<p class="text-xs text-base-content/60">{researchResult.macro_report.growth.real_gdp.context}</p>
									{/if}
								</div>
							{/if}

							<!-- Market -->
							{#if researchResult.macro_report.market}
								<div class="card bg-base-200 p-4">
									<h4 class="font-semibold text-sm mb-2">Market</h4>
									{#if researchResult.macro_report.market.vix}
										<p class="text-xs">VIX: {researchResult.macro_report.market.vix.price || 'N/A'}</p>
									{/if}
									{#if researchResult.macro_report.market.sp500}
										<p class="text-xs">S&P 500: ${researchResult.macro_report.market.sp500.price || 'N/A'}
											{#if researchResult.macro_report.market.sp500.change_percent}
												<span class="text-xs {researchResult.macro_report.market.sp500.change_percent?.startsWith('-') ? 'text-error' : 'text-success'}">
													({researchResult.macro_report.market.sp500.change_percent})
												</span>
											{/if}
										</p>
									{/if}
									{#if researchResult.macro_report.market.sector_etf}
										<p class="text-xs">Sector ({researchResult.macro_report.market.sector_etf.symbol}): ${researchResult.macro_report.market.sector_etf.price || 'N/A'}
											{#if researchResult.macro_report.market.sector_etf.change_percent}
												<span class="text-xs {researchResult.macro_report.market.sector_etf.change_percent?.startsWith('-') ? 'text-error' : 'text-success'}">
													({researchResult.macro_report.market.sector_etf.change_percent})
												</span>
											{/if}
										</p>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<div class="divider divider-primary mt-8"></div>

			<ReportFooter />
		</div>
	</div>

	<!-- Scroll to Top Button -->
	<ScrollToTop threshold={400} />
{:else if !isRunningResearch}
	<EmptyReportState />
{/if}
