# OpenClaw Architecture Refactor Plan

Simplify the multi-agent system by removing SQLite and hardcoded prompts, replacing them with a human-readable file hierarchy. This will improve transparency, ease of debugging, and reduce token bloat.

## User Review Required

> [!IMPORTANT]
> **Data Migration**: I will migrate existing chat histories and long-term memories from the SQLite database (`gravity_claw.db`) into the new `.md` and `.json` files. Once verified, the database will be deleted.

> [!WARNING]
> **Performance**: Transitioning from FTS5 (SQLite search) to file-based memory might slightly change how agents "recall" facts in large datasets, but it will be much easier for you to manually audit and edit their memories.

## Proposed Changes

### [Component] File-Based Infrastructure

#### [NEW] Directory Hierarchy
- `/root/gravity-claw/workspace/`
    - `AGENTS.md` (Global fleet manual & role definitions)
    - `MEMORY.md` (Global long-term knowledge)
    - `shared-learnings/` (Patterns for SEO, Content, Sales)
    - `feedback/` (Decision logs)
- `/root/gravity-claw/workspace/agents/[agent-name]/`
    - `SOUL.md` (Identity & Personality)
    - `MEMORY.md` (Agent-specific learnings)
    - `history/` (Per-chat JSON files)

### [Component] Agent Engine Refactor

#### [MODIFY] [loop.ts](file:///root/gravity-claw/src/agent/loop.ts)
- Replace `loadChatHistory` and `saveChatHistory` with file-based versions targeting the `history/` folder.
- Update `getHistory` to read from the cache/file system.

#### [MODIFY] [db.ts](file:///root/gravity-claw/src/memory/db.ts)
- Implement `FileDB` class to replace SQLite.
- `addMemory` -> Writes to `MEMORY.md` or `shared-learnings/`.
- `searchMemories` -> Performs a simple text-based search across `.md` files in the workspace.

#### [MODIFY] [index.ts](file:///root/gravity-claw/src/index.ts)
- Remove hardcoded system prompt strings.
- Implement a bootstrapper that loads `SOUL.md` and `AGENTS.md` to construct system instructions.
- Initialize the `workspace` structure if it doesn't exist.

## Verification Plan

### Automated Verification
- Run a migration script to verify SQLite data is correctly mapped to files.
- Log file-load events during bot startup.

### Manual Verification
- Message **Max** or **Asan** in Telegram.
- Open the corresponding `history/` or `SOUL.md` file on the VPS and verify the changes are reflected instantly as text.
