import { randomUUID } from "node:crypto"

import {
  HOOK_EVENTS,
  EVENT_STATUS,
  type HookPayload,
  type NormalizedEvent,
  type EventStatus,
} from "./types.ts"

const truncate = (text: string, maxLength = 120): string =>
  text.length > maxLength ? text.slice(0, maxLength) + "…" : text

const toolSummarizers: Record<string, (input: Record<string, unknown>) => string> = {
  Bash: (input) => truncate(String(input.command ?? "")),
  Read: (input) => String(input.file_path ?? ""),
  Write: (input) => String(input.file_path ?? ""),

  Edit: (input) => {
    const path = String(input.file_path ?? "")
    const old = String(input.old_string ?? "").slice(0, 40)
    const replacement = String(input.new_string ?? "").slice(0, 40)
    return `${path} (${truncate(old, 40)} → ${truncate(replacement, 40)})`
  },

  Glob: (input) => {
    const pattern = String(input.pattern ?? "")
    const path = input.path ? ` in ${input.path}` : ""
    return `${pattern}${path}`
  },

  Grep: (input) => {
    const pattern = String(input.pattern ?? "")
    const path = input.path ? ` in ${input.path}` : ""
    return `${pattern}${path}`
  },

  WebFetch: (input) => truncate(String(input.url ?? "")),
  WebSearch: (input) => truncate(String(input.query ?? "")),

  Agent: (input) => {
    const type = input.subagent_type ? `[${input.subagent_type}] ` : ""
    const desc = String(input.description ?? input.prompt ?? "")
    return `${type}${truncate(desc)}`
  },

  Skill: (input) => {
    const name = String(input.skill ?? "")
    const args = input.args ? ` ${input.args}` : ""
    return `${name}${args}`
  },
}

const summarizeTool = (toolName: string, input: Record<string, unknown>): string => {
  if (toolName.startsWith("mcp__")) {
    const parts = toolName.split("__")
    const server = parts[1] ?? "unknown"
    const tool = parts.slice(2).join("__") || "unknown"
    return `${server}/${tool}`
  }

  const summarizer = toolSummarizers[toolName]

  if (summarizer) {
    return summarizer(input)
  }

  return toolName
}

const buildToolEvent = (
  payload: HookPayload,
  status: EventStatus,
): NormalizedEvent => ({
  id: randomUUID(),
  timestamp: new Date().toISOString(),
  sessionId: payload.session_id,
  hookEvent: payload.hook_event_name,
  toolName: payload.tool_name ?? null,
  toolUseId: payload.tool_use_id ?? null,
  summary: summarizeTool(payload.tool_name ?? "", payload.tool_input ?? {}),
  detail: {
    toolInput: payload.tool_input,
    ...(payload.tool_response && { toolResponse: payload.tool_response }),
    ...(payload.error && { error: payload.error }),
  },
  status,
})

export const normalize = (payload: HookPayload): NormalizedEvent => {
  switch (payload.hook_event_name) {
    case HOOK_EVENTS.PRE_TOOL_USE:
      return buildToolEvent(payload, EVENT_STATUS.PENDING)

    case HOOK_EVENTS.POST_TOOL_USE:
      return buildToolEvent(payload, EVENT_STATUS.SUCCESS)

    case HOOK_EVENTS.POST_TOOL_USE_FAILURE:
      return buildToolEvent(payload, EVENT_STATUS.FAILURE)

    case HOOK_EVENTS.USER_PROMPT:
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: payload.session_id,
        hookEvent: payload.hook_event_name,
        toolName: null,
        toolUseId: null,
        summary: truncate(payload.prompt ?? ""),
        detail: { prompt: payload.prompt },
        status: EVENT_STATUS.INFO,
      }

    case HOOK_EVENTS.SESSION_START:
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: payload.session_id,
        hookEvent: payload.hook_event_name,
        toolName: null,
        toolUseId: null,
        summary: `Session started (${payload.source ?? "unknown"})`,
        detail: { source: payload.source, cwd: payload.cwd },
        status: EVENT_STATUS.INFO,
      }

    case HOOK_EVENTS.SESSION_END:
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: payload.session_id,
        hookEvent: payload.hook_event_name,
        toolName: null,
        toolUseId: null,
        summary: `Session ended (${payload.reason ?? "unknown"})`,
        detail: { reason: payload.reason },
        status: EVENT_STATUS.INFO,
      }

    case HOOK_EVENTS.SUBAGENT_START:
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: payload.session_id,
        hookEvent: payload.hook_event_name,
        toolName: null,
        toolUseId: null,
        summary: `Subagent started: ${payload.agent_type ?? "unknown"}`,
        detail: { agentId: payload.agent_id, agentType: payload.agent_type },
        status: EVENT_STATUS.INFO,
      }

    case HOOK_EVENTS.SUBAGENT_STOP:
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: payload.session_id,
        hookEvent: payload.hook_event_name,
        toolName: null,
        toolUseId: null,
        summary: `Subagent stopped: ${payload.agent_type ?? "unknown"}`,
        detail: {
          agentId: payload.agent_id,
          agentType: payload.agent_type,
          lastMessage: payload.last_assistant_message
            ? truncate(payload.last_assistant_message, 200)
            : null,
        },
        status: EVENT_STATUS.INFO,
      }

    case HOOK_EVENTS.STOP:
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: payload.session_id,
        hookEvent: payload.hook_event_name,
        toolName: null,
        toolUseId: null,
        summary: "Agent turn complete",
        detail: {
          lastMessage: payload.last_assistant_message
            ? truncate(payload.last_assistant_message, 200)
            : null,
        },
        status: EVENT_STATUS.INFO,
      }

    default:
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: payload.session_id,
        hookEvent: payload.hook_event_name,
        toolName: null,
        toolUseId: null,
        summary: `Unknown event: ${payload.hook_event_name}`,
        detail: payload as unknown as Record<string, unknown>,
        status: EVENT_STATUS.INFO,
      }
  }
}
