# Gravity Claw Project Tracker

Building a lean, secure, fully-understood version of OpenClaw. Architecture: TypeScript, Telegram-only (long-polling), `.env` secrets, Agentic loop, Gemini 3.0 Pro.

- [x] **Level 1 — Foundation**
    - [x] Telegram bot setup (`grammy`)
    - [x] Gemini LLM integration
    - [x] Basic agent loop with max-iterations
    - [x] Strict security: Telegram user ID whitelist only
    - [x] One test tool: `get_current_time`
    - [x] User runs `npm run dev` and tests the bot

- [x] **Level 2 — Memory**
    - [x] Persistent SQLite database setup (`better-sqlite3`)
    - [x] FTS5 (Full-Text Search) setup for memory
    - [x] Memory retrieval tools for the agent

- [ ] **Level 3 — Voice (SKIPPED)**
    - [ ] *User already uses Whisper Flow for OS-level dictation.*

- [x] **Level 4 — Tools (MCP)**
    - [x] MCP SDK installed and `mcp_config.json` created
    - [x] FileSystem MCP Server connected (read/write/list website files)
    - [x] Dynamic tool discovery wired into agent loop
    - [ ] Test: Modify website content via Telegram command

- [ ] **Level 5 — Heartbeat**
    - [ ] Proactive morning briefing
    - [ ] Scheduled check-ins
