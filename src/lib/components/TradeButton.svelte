<script lang="ts">
	import { TrendingUp } from '@lucide/svelte';

	export let symbol: string = '';
	export let companyName: string = '';
	export let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'error' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled: boolean = false;
	export let onclick: (() => void) | undefined = undefined;

	function handleClick() {
		if (!disabled) {
			onclick?.();
		}
	}

	// Compute button classes based on props
	$: buttonClasses = `
    btn 
    btn-${variant} 
    ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''} 
    ${disabled ? 'btn-disabled' : ''}
  `;
</script>

<button
	class={buttonClasses}
	onclick={handleClick}
	{disabled}
	title={disabled ? 'Trading not available' : `Create trade hypothesis for ${symbol}`}
>
	<TrendingUp class="h-5 w-5" />
	<slot>Create Hypothesis</slot>
</button>
