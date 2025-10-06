import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { supabaseServer } from '$lib/supabase-server';

// GET /api/user-jobs - Get all jobs for current user
export async function GET({ request }) {
  try {
    // Get user from session
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user token is valid using anon key
    const supabaseAnon = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    );

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS
    const supabaseService = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get all jobs for this user from user_research_history
    const { data: userJobs, error: jobsError } = await supabaseService
      .from('user_research_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Error fetching user jobs:', jobsError);
      return json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // For each job, get the current status from research_jobs table
    const jobsWithStatus = await Promise.all(
      (userJobs || []).map(async (job) => {
        if (!job.metadata?.main_job_id) {
          return {
            ...job,
            status: 'unknown',
            job_data: null
          };
        }

        // Get the main job from research_jobs (use service role to bypass RLS)
        const { data: researchJob, error: researchError } = await supabaseService
          .from('research_jobs')
          .select('*')
          .eq('main_job_id', job.metadata.main_job_id)
          .eq('job_name', 'main_flow')
          .maybeSingle();

        if (researchError) {
          console.warn('Error fetching research job:', researchError);
          return {
            ...job,
            status: 'unknown',
            job_data: null
          };
        }

        return {
          ...job,
          status: researchJob?.status || 'unknown',
          job_data: researchJob
        };
      })
    );

    return json({ jobs: jobsWithStatus });

  } catch (error) {
    console.error('User jobs endpoint error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user-jobs - Save a job to user's history
export async function POST({ request }) {
  try {
    console.log('📝 POST /api/user-jobs called');
    const { main_job_id, symbol, metadata } = await request.json();
    console.log('📝 Request body:', { main_job_id, symbol, metadata });

    if (!main_job_id || !symbol) {
      console.error('📝 Missing required fields');
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from session
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.error('📝 No authorization header');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('📝 Getting user from token...');

    // First verify the user token is valid using anon key
    const supabaseAnon = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    );

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

    if (authError || !user) {
      console.error('📝 Auth error:', authError);
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📝 User authenticated:', user.id);
    console.log('📝 Inserting into user_research_history...');

    // Use service role key to bypass RLS (we already verified the user above)
    const supabaseService = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Insert into user_research_history using service role (bypasses RLS)
    const { data, error } = await supabaseService
      .from('user_research_history')
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        metadata: {
          main_job_id,
          ...metadata
        }
      })
      .select()
      .single();

    if (error) {
      console.error('📝 Database error:', error);
      return json({ error: 'Failed to save job', details: error }, { status: 500 });
    }

    console.log('📝 Job saved successfully:', data);
    return json({ success: true, job: data });

  } catch (error) {
    console.error('📝 Save job endpoint error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
