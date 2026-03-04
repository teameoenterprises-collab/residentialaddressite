import { addMemory, searchMemories } from "../memory/db.js";

export const rememberFactToolDefinition = {
    name: "remember_fact",
    description: "Saves an important fact or preference about the user, the business, or the chat to long-term memory. Use this whenever the user tells you something you should not forget.",
    parameters: {
        type: "object",
        properties: {
            fact: {
                type: "string",
                description: "The core fact to remember (e.g. 'Aman is my business partner', 'The LLC Formation price is $149'). Be as descriptive as possible."
            },
            category: {
                type: "string",
                description: "The context of this memory. Use 'personal', 'business', 'hq', or 'preferences'."
            }
        },
        required: ["fact", "category"]
    }
};

export const searchMemoryToolDefinition = {
    name: "search_memory",
    description: "Searches long-term memory for previously saved facts or context. Use this if the user asks you a question about something you discussed in the past or if you need context about a person/detail.",
    parameters: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The search term or keyword to look for in memory."
            }
        },
        required: ["query"]
    }
};

export async function executeRememberFact(args: { fact: string, category: string }) {
    try {
        addMemory(args.fact, args.category);
        return `Successfully saved to memory: "${args.fact}" (Category: ${args.category})`;
    } catch (e) {
        console.error("Memory Save Error:", e);
        return "Failed to save memory due to an internal database error.";
    }
}

export async function executeSearchMemory(args: { query: string }) {
    try {
        const results = searchMemories(args.query);
        if (!results || results.length === 0) {
            return `No memories found matching query: "${args.query}"`;
        }

        // Format the results for the LLM
        let formatted = `Found ${results.length} relevant memories:\n`;
        results.forEach((row, i) => {
            formatted += `[${i + 1}] Category: ${row.category} | Fact: ${row.content}\n`;
        });

        return formatted;
    } catch (e) {
        console.error("Memory Search Error:", e);
        return "Failed to search memory due to an internal database error.";
    }
}
