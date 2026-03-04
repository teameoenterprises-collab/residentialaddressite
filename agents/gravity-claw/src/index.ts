import "dotenv/config";
import { Bot } from "grammy";
import { processAgentMessage } from "./agent/loop.js";
import { mcpManager } from "./tools/mcp.js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const AUTHORIZED_ID = process.env.AUTHORIZED_TELEGRAM_USER_ID ?
    parseInt(process.env.AUTHORIZED_TELEGRAM_USER_ID, 10) : undefined;

if (!TELEGRAM_BOT_TOKEN || !AUTHORIZED_ID) {
    console.error("CRITICAL: TELEGRAM_BOT_TOKEN or AUTHORIZED_TELEGRAM_USER_ID is not set in .env!");
    process.exit(1);
}

const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.use(async (ctx, next) => {
    const senderId = ctx.from?.id;
    const chatId = ctx.chat?.id;

    if (senderId !== AUTHORIZED_ID && chatId !== AUTHORIZED_ID) {
        console.warn(`[BLOCKED] Message from User: ${senderId} | Chat: ${chatId}`);
        return;
    }

    await next();
});

bot.on("message:text", async (ctx) => {
    const incomingMsg = ctx.message.text;
    const chatId = ctx.chat.id;
    console.log(`[RCVD] Chat: ${chatId} | User: ${ctx.from.id} -> ${incomingMsg}`);

    await ctx.replyWithChatAction("typing");

    try {
        const agentReply = await processAgentMessage(incomingMsg, chatId.toString());
        await ctx.reply(agentReply);
        console.log(`[SENT] Chat: ${chatId} -> ${agentReply}`);
    } catch (error) {
        console.error("Agent Loop Error:", error);
        await ctx.reply("⚠️ An error occurred while processing your request.");
    }
});

async function startBot() {
    console.log("🔌 Connecting to MCP Servers...");
    await mcpManager.loadConfigAndConnect();

    console.log(`
🦅 Gravity Claw (Telegram Edition) initialized.
🔒 Authorized ID: ${AUTHORIZED_ID}
⚡ Polling Telegram servers...
`);

    bot.start();
}

startBot();
