export const HOOK_EVENTS = {
  SESSION_START: "SessionStart",
  SESSION_END: "SessionEnd",
  USER_PROMPT: "UserPromptSubmit",
  PRE_TOOL_USE: "PreToolUse",
  POST_TOOL_USE: "PostToolUse",
  POST_TOOL_USE_FAILURE: "PostToolUseFailure",
  SUBAGENT_START: "SubagentStart",
  SUBAGENT_STOP: "SubagentStop",
  STOP: "Stop",
} as const

export type HookEventName = (typeof HOOK_EVENTS)[keyof typeof HOOK_EVENTS]

export const EVENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILURE: "failure",
  CANCELED: "canceled",
  INFO: "info",
} as const

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS]

export type NormalizedEvent = {
  id: string
  timestamp: string
  sessionId: string
  hookEvent: HookEventName
  toolName: string | null
  toolUseId: string | null
  summary: string
  detail: Record<string, unknown>
  status: EventStatus
}

export type HookPayload = {
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode: string
  hook_event_name: HookEventName
  tool_name?: string
  tool_input?: Record<string, unknown>
  tool_response?: Record<string, unknown>
  tool_use_id?: string
  error?: string
  is_interrupt?: boolean
  prompt?: string
  agent_id?: string
  agent_type?: string
  agent_transcript_path?: string
  last_assistant_message?: string
  source?: string
  reason?: string
  message?: string
}

export type WsMessage =
  | { type: "init"; events: NormalizedEvent[] }
  | { type: "event"; event: NormalizedEvent }
  | { type: "update"; event: NormalizedEvent }
