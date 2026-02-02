/**
 * Agent Status Message Types
 * For real-time agent thinking display (Feature 1.5)
 */

export interface AgentStatusMessage {
  id: string;
  job_id: string;
  sub_job_id: string;
  agent_name: string;
  message: string;
  message_type: 'info' | 'progress' | 'success' | 'warning';
  progress_percent?: number;
  created_at: string;
}

export interface AgentInfo {
  name: string;
  displayName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}
