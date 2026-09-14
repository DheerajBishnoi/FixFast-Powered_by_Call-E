import { execFile } from 'child_process';
import { promisify } from 'util';
import { Contractor, Incident, StructuredCallResult } from './types';
import { buildCalleCallPlan } from './prompt-builder';

const execFileAsync = promisify(execFile);

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

function getStructured(parsed: any): any {
  return parsed.result?.structuredContent || parsed.structuredContent || parsed;
}

/**
 * Check whether the local environment has the 'calle' CLI installed and authenticated.
 */
export async function checkCalleCliAvailable(): Promise<{ available: boolean; authenticated: boolean; error?: string }> {
  try {
    const { stdout: versionOut } = await execFileAsync('npx', ['calle', '--version'], { timeout: 5000 });
    try {
      const { stdout: authOut } = await execFileAsync('npx', ['calle', 'auth', 'status'], { timeout: 8000 });
      let authenticated = false;
      try {
        const parsed = JSON.parse(authOut);
        authenticated = !!parsed.usable;
      } catch {
        authenticated = authOut.includes('"usable": true') || authOut.includes('"usable":true');
      }
      return { available: true, authenticated };
    } catch {
      return { available: true, authenticated: false };
    }
  } catch (err: any) {
    return { available: false, authenticated: false, error: err.message };
  }
}

/**
 * Executes 'calle call plan' to generate a call plan and safety confirmation token.
 */
export async function planCalleCall(contractor: Contractor, incident: Incident): Promise<CalleCallPlanResult> {
  const plan = buildCalleCallPlan(contractor, incident);
  const safePhone = contractor.phone.replace(/[^0-9+]/g, '');

  try {
    const { stdout } = await execFileAsync('npx', ['calle', 'call', 'plan', '--to-phone', safePhone, '--goal', plan.goal, '--json'], { timeout: 60000 });
    const parsed = extractJsonFromCli(stdout);
    const s = getStructured(parsed);

    const planId = s.plan_id || s.planId || parsed.plan_id || `plan_${Date.now()}`;
    const confirmToken = s.confirm_token || s.confirmToken || parsed.confirm_token;

    if (!confirmToken) {
      throw new Error(`CALL-E did not return confirmation token: ${JSON.stringify(s)}`);
    }

    return {
      planId,
      confirmToken,
      previewPrompt: plan.goal
    };
  } catch (err: any) {
    console.error(`[CALL-E] plan_call error:`, err.message);
    throw new Error(`Failed to plan call: ${err.message}`);
  }
}

/**
 * Executes 'calle call run' with plan ID and confirmation token.
 */
export async function executeCalleCall(planId: string, confirmToken: string): Promise<{ runId: string }> {
  try {
    const { stdout } = await execFileAsync('npx', ['calle', 'call', 'run', '--plan-id', planId, '--confirm-token', confirmToken, '--json'], { timeout: 60000 });
    const parsed = extractJsonFromCli(stdout);
    const s = getStructured(parsed);

    const runId = s.run_id || s.runId || s.id || parsed.run_id || `run_${Date.now()}`;
    return { runId };
  } catch (err: any) {
    console.error(`[CALL-E] run_call error:`, err.message);
    throw new Error(`Failed to execute call: ${err.message}`);
  }
}

/**
 * Polls status from 'calle call status'.
 */
export async function pollCalleRun(runId: string): Promise<CalleRunStatusResult> {
  try {
    const { stdout } = await execFileAsync('npx', ['calle', 'call', 'status', '--run-id', runId, '--json'], { timeout: 20000 });
    const parsed = extractJsonFromCli(stdout);
    const s = getStructured(parsed);

    return {
      runId,
      status: s.status || parsed.status || 'in_progress',
      transcript: s.transcript || parsed.transcript || [],
      structuredOutput: s.data || s.structured_output || parsed.data
    };
  } catch (err: any) {
    console.error(`[CALL-E] get_call_run error:`, err.message);
    throw new Error(`Failed to poll call: ${err.message}`);
  }
}
