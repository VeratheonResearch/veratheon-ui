/**
 * Start a new research job
 */
export async function startResearch(
	symbol: string,
	forceRecompute: boolean,
	model: string
): Promise<{ job_id: string }> {
	const response = await fetch('/api/research/start', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			symbol: symbol.trim().toUpperCase(),
			force_recompute: forceRecompute,
			model: model
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to start research: ${response.statusText}`);
	}

	return await response.json();
}

/**
 * Check the status of a research job
 */
export async function checkJobStatus(jobId: string, symbol: string): Promise<any> {
	const response = await fetch(
		`/api/research/status/${symbol.trim().toUpperCase()}?job_id=${jobId}`,
		{
			method: 'GET'
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to check status: ${response.statusText}`);
	}

	return await response.json();
}

/**
 * Save a job to user history
 */
export async function saveJobToHistory(
	mainJobId: string,
	symbol: string,
	forceRecompute: boolean,
	getAccessToken: () => Promise<string | null>
): Promise<void> {
	try {
		console.log('🔍 saveJobToHistory called with:', { mainJobId, symbol });

		const accessToken = await getAccessToken();
		console.log('🔍 Access token check:', accessToken ? 'Token found' : 'No token');

		if (!accessToken) {
			console.warn('⚠️ No access token found, skipping save to history');
			return;
		}

		console.log('🔍 Making POST request to /api/user-jobs...');
		const response = await fetch('/api/user-jobs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				main_job_id: mainJobId,
				symbol: symbol,
				metadata: {
					force_recompute: forceRecompute
				}
			})
		});

		console.log('🔍 Response status:', response.status);
		const responseData = await response.json();
		console.log('🔍 Response data:', responseData);

		if (!response.ok) {
			console.error('❌ Failed to save job to history:', responseData);
		} else {
			console.log('✅ Job saved to user history successfully!');
		}
	} catch (error) {
		console.error('❌ Error saving job to history:', error);
	}
}
