import Database from 'better-sqlite3';
import path from 'path';

// Create a persistent database file in the project root
const dbPath = path.resolve(process.cwd(), 'gravity_claw.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize the database with an FTS5 table for lightning-fast memory retrieval
export function initDB() {
    // FTS5 creates a virtual table optimized for full-text search.
    // We store the raw memory text, the timestamp, and an optional category (e.g., "personal", "hq")
    db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS memories USING fts5(
            content,
            category,
            timestamp UNINDEXED
        );
    `);

    // Chat history table — survives bot restarts
    db.exec(`
        CREATE TABLE IF NOT EXISTS chat_history (
            chat_id TEXT PRIMARY KEY,
            history_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);

    console.log("🧠 SQLite Memory Foundation Initialized.");
}

// Add a memory to the database
export function addMemory(content: string, category: string = 'general') {
    const stmt = db.prepare('INSERT INTO memories (content, category, timestamp) VALUES (?, ?, ?)');
    stmt.run(content, category, new Date().toISOString());
    return true;
}

// Search memories using FTS5 match syntax
export function searchMemories(query: string, limit: number = 5): any[] {
    // 1. Clean the query
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    const keywords = cleanQuery.split(/\s+/).filter(word => word.length > 2);

    // We will collect results from multiple strategies
    const uniqueResults = new Map();

    const addResults = (results: any[]) => {
        for (const row of results) {
            uniqueResults.set(row.content, row);
        }
    };

    try {
        // Strategy A: FTS5 Exact Phrase Match
        if (cleanQuery.length > 0) {
            try {
                const exactStmt = db.prepare('SELECT content, category, timestamp FROM memories WHERE memories MATCH ? ORDER BY rank LIMIT ?');
                const exactResults = exactStmt.all(`"${cleanQuery}"*`, limit);
                addResults(exactResults);
            } catch (e) { }
        }

        // Strategy B: FTS5 OR Match (Matches any of the keywords)
        if (keywords.length > 0) {
            let ftsQuery = keywords.map(term => `${term}*`).join(' OR ');
            try {
                const ftsStmt = db.prepare('SELECT content, category, timestamp FROM memories WHERE memories MATCH ? ORDER BY rank LIMIT ?');
                const ftsResults = ftsStmt.all(ftsQuery, limit);
                addResults(ftsResults);
            } catch (e) { }
        }

        // Strategy C: Absolute Fallback using standard LIKE for every keyword
        for (const word of keywords) {
            const likeStmt = db.prepare(`SELECT content, category, timestamp FROM memories WHERE content LIKE ? LIMIT ?`);
            const likeResults = likeStmt.all(`%${word}%`, limit);
            addResults(likeResults);
        }

        // Strategy D: Recency Fallback (If Semantic/Fuzzy search found literally nothing)
        // If the LLM asks "What city am I in?" but the fact was saved as "Location is Toronto", 
        // the word "city" doesn't exist in the DB. So we just return the 5 most recent memories.
        if (uniqueResults.size === 0) {
            console.log(`[DB] No fuzzy matches found for "${query}". Returning the ${limit} most recent memories as a fallback.`);
            const recentStmt = db.prepare(`SELECT content, category, timestamp FROM memories ORDER BY timestamp DESC LIMIT ?`);
            const recentResults = recentStmt.all(limit);
            addResults(recentResults);
        }

        // Return Array
        return Array.from(uniqueResults.values()).slice(0, limit);

    } catch (e) {
        console.error(`[DB] Massive Search Error:`, e);
        return [];
    }
}

// ─── Chat History Persistence ───────────────────────────────────────────────

export function saveChatHistory(chatId: string, history: any[]) {
    const stmt = db.prepare(`
        INSERT INTO chat_history (chat_id, history_json, updated_at) 
        VALUES (?, ?, ?)
        ON CONFLICT(chat_id) DO UPDATE SET 
            history_json = excluded.history_json,
            updated_at = excluded.updated_at
    `);
    stmt.run(chatId, JSON.stringify(history), new Date().toISOString());
}

export function loadChatHistory(chatId: string): any[] {
    const stmt = db.prepare('SELECT history_json FROM chat_history WHERE chat_id = ?');
    const row = stmt.get(chatId) as { history_json: string } | undefined;
    if (row) {
        try {
            return JSON.parse(row.history_json);
        } catch {
            return [];
        }
    }
    return [];
}

// Initialize the DB immediately when this module is imported
initDB();

export default db;

