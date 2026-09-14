import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { Contractor, Incident, StructuredCallResult } from './types';
import { buildCalleCallPlan } from './prompt-builder';

const execFileAsync = promisify(execFile);

async function runCalle(args: string[], options: any = {}): Promise<{ stdout: string; stderr: string }> {
  const localBin = path.resolve(process.cwd(), 'node_modules/@call-e/cli/bin/calle.js');
  let res: { stdout: any; stderr: any };
  if (fs.existsSync(localBin)) {
    res = await execFileAsync(process.execPath, [localBin, ...args], { encoding: 'utf-8', ...options });
  } else {
    const isWin = process.platform === 'win32';
    res = await execFileAsync(isWin ? 'npx.cmd' : 'npx', ['calle', ...args], { encoding: 'utf-8', ...options, shell: isWin });
  }
  return {
    stdout: String(res.stdout || ''),
    stderr: String(res.stderr || '')
  };
}

export interface CalleCallPlanResult {
  planId: string;
  confirmToken: string;
  previewPrompt: string;
}

export interface CalleRunStatusResult {
  runId: string;
  status: string;
  durationSeconds?: number;
  transcript?: Array<{ speaker: 'agent' | 'contractor' | 'ivr'; text: string; timestamp: string }>;
  structuredOutput?: any;
  summary?: string;
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
    const { stdout: versionOut } = await runCalle(['--version'], { timeout: 5000 });
    try {
      const { stdout: authOut } = await runCalle(['auth', 'status'], { timeout: 8000 });
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
    const { stdout } = await runCalle(['call', 'plan', '--to-phone', safePhone, '--goal', plan.goal, '--json'], { timeout: 60000 });
    const parsed = extractJsonFromCli(stdout);
    const s = getStructured(parsed);

    const planId = s.plan_id || s.planId || parsed.plan_id || `plan_${Date.now()}`;
    const confirmToken = s.confirm_token || s.confirmToken || parsed.confirm_token;

    if (!confirmToken) {
      let reason = '';
      if (Array.isArray(s.clarifying_questions) && s.clarifying_questions.length > 0) {
        reason = s.clarifying_questions.join(' ');
      } else if (s.confirm_summary) {
        reason = s.confirm_summary;
      } else if (Array.isArray(s.questions) && s.questions.length > 0) {
        reason = s.questions.map((q: any) => q.question || '').filter(Boolean).join(' ');
      } else if (s.error) {
        reason = typeof s.error === 'string' ? s.error : JSON.stringify(s.error);
      } else {
        reason = JSON.stringify(s);
      }

      if (reason.toLowerCase().includes('insufficient') || reason.toLowerCase().includes('top up') || reason.toLowerCase().includes('balance')) {
        throw new Error('Insufficient CALL-E account balance. Please top up your credits at https://dashboard.heycall-e.com/account/billing or switch to Judge Dry-Run Mode.');
      }

      throw new Error(reason);
    }

    return {
      planId,
      confirmToken,
      previewPrompt: plan.goal
    };
  } catch (err: any) {
    console.error(`[CALL-E] plan_call error:`, err.message);
    throw err;
  }
}

/**
 * Executes 'calle call run' with plan ID and confirmation token.
 */
export async function executeCalleCall(planId: string, confirmToken: string): Promise<{ runId: string }> {
  try {
    const { stdout } = await runCalle(['call', 'run', '--plan-id', planId, '--confirm-token', confirmToken, '--json'], { timeout: 60000 });
    const parsed = extractJsonFromCli(stdout);
    const s = getStructured(parsed);

    const runId = s.run_id || s.runId || s.id || parsed.run_id || `run_${Date.now()}`;
    return { runId };
  } catch (err: any) {
    console.error(`[CALL-E] run_call error:`, err.message);
    throw new Error(`Failed to execute call: ${err.message}`);
  }
}

export function parseTranscriptText(text: string): Array<{ speaker: 'agent' | 'contractor' | 'ivr'; text: string; timestamp: string }> {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const messages: Array<{ speaker: 'agent' | 'contractor' | 'ivr'; text: string; timestamp: string }> = [];

  for (const line of lines) {
    const match = line.match(/^\[([0-9:]+)\]\s*(BOT|USER|AGENT|CONTRACTOR|IVR):\s*(.*)$/i);
    if (match) {
      const ts = match[1];
      const role = match[2].toUpperCase();
      const content = match[3];
      const speaker: 'agent' | 'contractor' | 'ivr' = (role === 'BOT' || role === 'AGENT') ? 'agent' : (role === 'IVR') ? 'ivr' : 'contractor';
      messages.push({
        speaker,
        text: content,
        timestamp: ts
      });
    } else if (messages.length > 0) {
      messages[messages.length - 1].text += ' ' + line;
    }
  }
  return messages;
}

export function parseActivityEvents(activity: any[]): Array<{ speaker: 'agent' | 'contractor' | 'ivr'; text: string; timestamp: string }> {
  if (!Array.isArray(activity)) return [];
  const messages: Array<{ speaker: 'agent' | 'contractor' | 'ivr'; text: string; timestamp: string }> = [];

  for (const act of activity) {
    if (act.message && typeof act.message === 'string') {
      const ts = new Date(act.ts || Date.now()).toLocaleTimeString();
      if (act.message.startsWith('Bot is speaking: ')) {
        const text = act.message.replace('Bot is speaking: ', '').trim();
        if (text) messages.push({ speaker: 'agent', text, timestamp: ts });
      } else if (act.message.startsWith('Callee said: ')) {
        const text = act.message.replace('Callee said: ', '').trim();
        if (text) {
          const last = messages[messages.length - 1];
          if (last && last.speaker === 'contractor' && text.startsWith(last.text)) {
            last.text = text;
            last.timestamp = ts;
          } else {
            messages.push({ speaker: 'contractor', text, timestamp: ts });
          }
        }
      }
    }
  }
  return messages;
}

/**
 * Polls status from 'calle call status'.
 */
export async function pollCalleRun(runId: string): Promise<CalleRunStatusResult> {
  try {
    const { stdout } = await runCalle(['call', 'status', '--run-id', runId, '--json'], { timeout: 20000 });
    const parsed = extractJsonFromCli(stdout);
    const s = getStructured(parsed);

    const rawStatus = s.status || parsed.status || 'in_progress';
    const normalizedStatus = String(rawStatus).toLowerCase();

    // Transcript extraction
    let transcript: Array<{ speaker: 'agent' | 'contractor' | 'ivr'; text: string; timestamp: string }> = [];
    if (typeof s.result?.transcript === 'string') {
      transcript = parseTranscriptText(s.result.transcript);
    } else if (Array.isArray(s.activity) && s.activity.length > 0) {
      transcript = parseActivityEvents(s.activity);
    } else if (Array.isArray(s.transcript)) {
      transcript = s.transcript;
    }

    // Duration extraction
    const durationSeconds = s.result?.calling?.duration_seconds 
      || s.result?.calling?.calls?.[0]?.duration_seconds 
      || 0;

    const summary = s.result?.summary || s.result?.post_summary || '';

    return {
      runId,
      status: normalizedStatus,
      durationSeconds,
      transcript,
      structuredOutput: s.result?.extracted || s.data || s.structured_output,
      summary
    };
  } catch (err: any) {
    console.error(`[CALL-E] get_call_run error:`, err.message);
    throw new Error(`Failed to poll call: ${err.message}`);
  }
}
