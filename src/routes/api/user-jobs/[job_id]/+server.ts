import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { supabaseServer } from '$lib/supabase-server';

// GET /api/user-jobs/[job_id] - Get specific job details including results
export async function GET({ params, request }) {
  try {
    const { job_id } = params;

    if (!job_id) {
      return json({ error: 'Job ID required' }, { status: 400 });
    }

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

    // Get the job from user_research_history
    const { data: userJob, error: userJobError } = await supabaseService
      .from('user_research_history')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single();

    if (userJobError) {
      console.error('Error fetching user job:', userJobError);
      return json({ error: 'Job not found' }, { status: 404 });
    }

    const main_job_id = userJob.metadata?.main_job_id;

    if (!main_job_id) {
      return json({
        job: userJob,
        status: 'unknown',
        research_data: null
      });
    }

    // Get the main research job (use service role to bypass RLS)
    const { data: mainJob, error: mainJobError } = await supabaseService
      .from('research_jobs')
      .select('*')
      .eq('main_job_id', main_job_id)
      .eq('job_name', 'main_flow')
      .maybeSingle();

    if (mainJobError) {
      console.warn('Error fetching main job:', mainJobError);
      return json({
        job: userJob,
        status: 'unknown',
        research_data: null
      });
    }

    // Get all subjobs for this main job (use service role to bypass RLS)
    const { data: subJobs, error: subJobsError } = await supabaseService
      .from('research_jobs')
      .select('*')
      .eq('main_job_id', main_job_id)
      .neq('job_name', 'main_flow')
      .order('created_at', { ascending: true });

    if (subJobsError) {
      console.warn('Error fetching sub jobs:', subJobsError);
    }

    return json({
      job: userJob,
      status: mainJob?.status || 'unknown',
      research_data: {
        main_job: mainJob,
        sub_jobs: subJobs || [],
        result: mainJob?.metadata?.result || null,
        steps: mainJob?.metadata?.steps || []
      }
    });

  } catch (error) {
    console.error('Get job details endpoint error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
