import { json } from '@sveltejs/kit';
import { API_URL } from '$lib/config';

export async function GET({ params }) {
  try {
    const { symbol } = params;
    
    if (!symbol || typeof symbol !== 'string') {
      return json({ error: 'Invalid symbol' }, { status: 400 });
    }

    // Call FastAPI backend to check report status
    const response = await fetch(`${API_URL}/report-status/${symbol.trim().toUpperCase()}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return json(result);
    
  } catch (error) {
    console.error('Report status check error:', error);
    return json(
      { error: error.message || 'Failed to check report status' }, 
      { status: 500 }
    );
  }
}
