import { json } from '@sveltejs/kit';
import { API_URL } from '$lib/config';

export async function POST({ request }) {
  try {
    const { symbol } = await request.json();

    if (!symbol || typeof symbol !== 'string') {
      return json({ error: 'Invalid symbol' }, { status: 400 });
    }

    const symbolUpper = symbol.trim().toUpperCase();

    // Call FastAPI backend to start research job
    const response = await fetch(`${API_URL}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: symbolUpper
      })
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    return json({
      success: true,
      job_id: result.job_id,
      message: result.message,
      symbol: symbolUpper
    });

  } catch (error) {
    console.error('Start research endpoint error:', error);
    return json(
      { error: error.message || 'Failed to start research' },
      { status: 500 }
    );
  }
}