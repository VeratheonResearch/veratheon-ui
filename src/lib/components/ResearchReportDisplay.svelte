<script lang="ts">
	import type { WorkflowResult } from '$lib/research-types';
	import ReportFooter from '$lib/components/ReportFooter.svelte';
	import EmptyReportState from '$lib/components/EmptyReportState.svelte';
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

	// Track which section is expanded (default to synthesis)
	let expandedSection = $state<string | null>('synthesis');

	function toggleSection(section: string) {
		expandedSection = expandedSection === section ? null : section;
	}
</script>

{#if researchResult?.synthesis_report}
	<!-- Synthesis Report (Main) -->
	<div class="mb-6">
		<button
			class="flex items-center justify-between w-full text-left"
			onclick={() => toggleSection('synthesis')}
		>
			<h3 class="text-lg md:text-xl font-bold text-primary flex items-center gap-2">
				<TrendingUp class="w-6 h-6" />
				Investment Synthesis
			</h3>
			<span class="text-base-content/60">{expandedSection === 'synthesis' ? '▼' : '▶'}</span>
		</button>
		{#if expandedSection === 'synthesis'}
			<div class="mt-4 prose prose-sm md:prose-base max-w-none">
				{@html renderMarkdown(researchResult.synthesis_report)}
			</div>
		{/if}
	</div>

	<div class="divider divider-primary"></div>

	<!-- Trade Advice (with disclaimer styling) -->
	{#if researchResult.trade_advice}
		<div class="mb-6">
			<button
				class="flex items-center justify-between w-full text-left"
				onclick={() => toggleSection('trade')}
			>
				<h3 class="text-lg md:text-xl font-bold text-warning flex items-center gap-2">
					<Lightbulb class="w-6 h-6" />
					Trade Ideas
					<span class="badge badge-warning badge-sm">Advisory Only</span>
				</h3>
				<span class="text-base-content/60">{expandedSection === 'trade' ? '▼' : '▶'}</span>
			</button>
			{#if expandedSection === 'trade'}
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
		<div class="mb-6">
			<button
				class="flex items-center justify-between w-full text-left"
				onclick={() => toggleSection('quantitative')}
			>
				<h3 class="text-lg md:text-xl font-bold text-secondary flex items-center gap-2">
					<BarChart3 class="w-6 h-6" />
					Quantitative Analysis
				</h3>
				<span class="text-base-content/60">{expandedSection === 'quantitative' ? '▼' : '▶'}</span>
			</button>
			{#if expandedSection === 'quantitative'}
				<div class="mt-4 prose prose-sm md:prose-base max-w-none">
					{@html renderMarkdown(researchResult.quantitative_report)}
				</div>
			{/if}
		</div>

		<div class="divider"></div>
	{/if}

	<!-- Qualitative Analysis -->
	{#if researchResult.qualitative_report}
		<div class="mb-6">
			<button
				class="flex items-center justify-between w-full text-left"
				onclick={() => toggleSection('qualitative')}
			>
				<h3 class="text-lg md:text-xl font-bold text-accent flex items-center gap-2">
					<Newspaper class="w-6 h-6" />
					Qualitative Analysis
				</h3>
				<span class="text-base-content/60">{expandedSection === 'qualitative' ? '▼' : '▶'}</span>
			</button>
			{#if expandedSection === 'qualitative'}
				<div class="mt-4 prose prose-sm md:prose-base max-w-none">
					{@html renderMarkdown(researchResult.qualitative_report)}
				</div>
			{/if}
		</div>

		<div class="divider"></div>
	{/if}

	<!-- Macro Economic Context -->
	{#if researchResult.macro_report}
		<div class="mb-6">
			<button
				class="flex items-center justify-between w-full text-left"
				onclick={() => toggleSection('macro')}
			>
				<h3 class="text-lg md:text-xl font-bold text-info flex items-center gap-2">
					<Globe class="w-6 h-6" />
					Macro Economic Context
				</h3>
				<span class="text-base-content/60">{expandedSection === 'macro' ? '▼' : '▶'}</span>
			</button>
			{#if expandedSection === 'macro'}
				<div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<!-- Inflation -->
					{#if researchResult.macro_report.inflation}
						<div class="card bg-base-200 p-4">
							<h4 class="font-semibold text-sm mb-2">📈 Inflation</h4>
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
							<h4 class="font-semibold text-sm mb-2">👥 Employment</h4>
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
							<h4 class="font-semibold text-sm mb-2">💰 Interest Rates</h4>
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
							<h4 class="font-semibold text-sm mb-2">📊 Growth</h4>
							<p class="text-xs">Real GDP: ${researchResult.macro_report.growth.real_gdp.value || 'N/A'}B</p>
							{#if researchResult.macro_report.growth.real_gdp.context}
								<p class="text-xs text-base-content/60">{researchResult.macro_report.growth.real_gdp.context}</p>
							{/if}
						</div>
					{/if}

					<!-- Market -->
					{#if researchResult.macro_report.market}
						<div class="card bg-base-200 p-4">
							<h4 class="font-semibold text-sm mb-2">📉 Market</h4>
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
{:else if !isRunningResearch}
	<EmptyReportState />
{/if}
