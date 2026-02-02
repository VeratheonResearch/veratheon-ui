/**
 * SSE Proxy Endpoint for Agent Status Streaming
 * Forwards Server-Sent Events from backend to frontend
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_URL } from '$lib/config';

export const GET: RequestHandler = async ({ params, fetch }) => {
  const { job_id } = params;

  if (!job_id) {
    throw error(400, 'Job ID is required');
  }

  try {
    // Create a readable stream that proxies SSE from backend
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const response = await fetch(`${API_URL}/research/stream/${job_id}`);

          if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();

          // Read and forward chunks from backend
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            // Forward the chunk to the client
            controller.enqueue(value);
          }
        } catch (err) {
          console.error('SSE proxy error:', err);
          // Send error event and close
          const errorMessage = `event: error\ndata: ${JSON.stringify({ error: 'Stream error' })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (err) {
    console.error('Failed to create SSE stream:', err);
    throw error(500, 'Failed to establish stream connection');
  }
};
