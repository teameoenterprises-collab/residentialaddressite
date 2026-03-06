# Task: Build Multi-Agent Org Chart (Teameo Enterprises)

- [x] Add all Department Head bot tokens to `.env`
- [x] Refactor `index.ts` to launch multiple Telegraf/grammy bot instances concurrently
- [x] Develop routing logic (deciding which agent handles which message)
- [x] Refactor `loop.ts` memory architecture (`botName_chatId`) to isolate agent contexts
- [x] Build "Hive Mind" memory injection (`injectMemoryToOtherBots`) to bypass Telegram bot blindness
- [x] Implement Head of R&D (Asan) capabilities
- [x] Implement Head of Sales (MarkBTM) capabilities
- [x] Implement Head of Marketing (Vikas) capabilities
- [x] Implement Head of Operations (Ahmad) capabilities

# Phase 2: Department Build-Out (R&D)
- [ ] Research and install a YouTube transcript extraction library (e.g., `youtube-transcript` or `youtube-transcript-api`).
- [ ] Create a native `tools/youtube.ts` to fetch transcripts from URLs.
- [ ] Expose the YouTube transcript tool exclusively to Asan.
- [ ] Ensure Asan can process the transcript and save synthesized notes into the shared memory/database.
- [ ] Create an `antigravity_backlog.md` file layout so Max can log complex engineering requests for AntiGravity to execute later.
