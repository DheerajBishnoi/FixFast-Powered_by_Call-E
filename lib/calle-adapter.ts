import { exec } from 'child_process';
import { promisify } from 'util';
import { Contractor, Incident, StructuredCallResult } from './types';
import { buildCalleCallPlan } from './prompt-builder';

const execAsync = promisify(exec);

export interface CalleCallPlanResult {
  planId: string;
  confirmToken: string;
  previewPrompt: string;
}

export interface CalleRunStatusResult {
  runId: string;
  status: string;
  transcript?: Array<{ speaker: string; text: string }>;
  structuredOutput?: any;
}

/**
 * Safely extracts JSON from CLI output which might contain warnings or non-JSON prefix text.
 */
function extractJsonFromCli(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to extract JSON from CLI output: ${text.substring(0, 100)}...`);
  }
}

/**
 * Check whether the local environment has the 'calle' CLI installed and authenticated.
 */
export async function checkCalleCliAvailable(): Promise<{ available: boolean; authenticated: boolean; error?: string }> {
  try {
    const { stdout: versionOut } = await execAsync('calle --version', { timeout: 3000 });
    try {
      const { stdout: authOut } = await execAsync('calle auth status', { timeout: 4000 });
      const authenticated = !authOut.toLowerCase().includes('not logged in') && !authOut.toLowerCase().includes('unauthenticated');
      return { available: true, authenticated };
    } catch {
      return { available: true, authenticated: false };
    }
  } catch (err: any) {
    return { available: false, authenticated: false, error: err.message };
  }
}

/**
 * Executes 'calle plan_call' to generate a call plan and safety confirmation token.
 */
export async function planCalleCall(contractor: Contractor, incident: Incident): Promise<CalleCallPlanResult> {
  const plan = buildCalleCallPlan(contractor, incident);
  // Using single quotes around the JSON string payload to avoid Windows cmd escaping issues
  const planJson = JSON.stringify(plan).replace(/"/g, '\\"');

  try {
    const { stdout } = await execAsync(`calle plan_call --input "${planJson}"`, { timeout: 15000 });
    const parsed = extractJsonFromCli(stdout);
    return {
      planId: parsed.plan_id || parsed.id || `plan_${Date.now()}`,
      confirmToken: parsed.confirm_token || `tok_${Math.random().toString(36).substring(7)}`,
      previewPrompt: plan.goal
    };
  } catch (err: any) {
    console.error(`[CALL-E] plan_call error:`, err.message);
    throw new Error(`Failed to plan call: ${err.message}`);
  }
}

/**
 * Executes 'calle run_call' with plan ID and confirmation token.
 */
export async function executeCalleCall(planId: string, confirmToken: string): Promise<{ runId: string }> {
  try {
    const { stdout } = await execAsync(`calle run_call --plan-id "${planId}" --confirm-token "${confirmToken}"`, { timeout: 15000 });
    const parsed = extractJsonFromCli(stdout);
    return { runId: parsed.run_id || parsed.id || `run_${Date.now()}` };
  } catch (err: any) {
    console.error(`[CALL-E] run_call error:`, err.message);
    throw new Error(`Failed to execute call: ${err.message}`);
  }
}

/**
 * Polls status from 'calle get_call_run'.
 */
export async function pollCalleRun(runId: string): Promise<CalleRunStatusResult> {
  try {
    const { stdout } = await execAsync(`calle get_call_run --run-id "${runId}"`, { timeout: 10000 });
    const parsed = extractJsonFromCli(stdout);
    return {
      runId,
      status: parsed.status || 'in_progress',
      transcript: parsed.transcript || [],
      structuredOutput: parsed.data || parsed.structured_output
    };
  } catch (err: any) {
    console.error(`[CALL-E] get_call_run error:`, err.message);
    throw new Error(`Failed to poll call: ${err.message}`);
  }
}
