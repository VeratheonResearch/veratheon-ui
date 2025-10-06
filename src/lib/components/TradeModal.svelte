<script lang="ts">
	import TradeForm from './TradeForm.svelte';
	import type { TradeDetails } from '$lib/research-types';

	export let isOpen = false;
	export let symbol: string = '';
	export let companyName: string = '';
	export let onclose: (() => void) | undefined = undefined;
	export let onsubmit: ((detail: TradeDetails) => void) | undefined = undefined;

	// Create a reference to the TradeForm component
	let tradeFormComponent: TradeForm;

	function handleClose() {
		onclose?.();
	}

	function handleModalClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleSubmit(event: CustomEvent<TradeDetails>) {
		onsubmit?.(event.detail);
		handleClose();
	}

	// Reset form when modal is opened
	$: if (isOpen && tradeFormComponent) {
		tradeFormComponent.resetForm();
	}
</script>

<div
	class="modal {isOpen ? 'modal-open' : ''}"
	onclick={handleModalClick}
	onkeydown={(e) => e.key === 'Escape' && handleClose()}
	role="dialog"
	aria-modal="true"
	aria-label="Trade specification"
	tabindex="-1"
>
	<div class="modal-box max-w-md">
		<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm" onclick={handleClose}
			>✕</button
		>

		<TradeForm bind:this={tradeFormComponent} {symbol} {companyName} on:submit={handleSubmit} />
	</div>
</div>
