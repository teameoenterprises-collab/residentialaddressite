import "dotenv/config";
import { Bot, Context, InputFile } from "grammy";
import { processAgentMessage, AgentContext, FILE_MAP } from "./agent/loop.js";
import { mcpManager } from "./tools/mcp.js";
import { startAutoBackup } from "./backup.js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ASAN_TOKEN = process.env.TELEGRAM_ASAN_TOKEN;
const TELEGRAM_MARK_BTM_TOKEN = process.env.TELEGRAM_MARK_BTM_TOKEN;
const TELEGRAM_VIKAS_TOKEN = process.env.TELEGRAM_VIKAS_TOKEN;
const TELEGRAM_AHMAD_TOKEN = process.env.TELEGRAM_AHMAD_TOKEN;
const HQ_GROUP_ID = process.env.HQ_GROUP_ID; // Using main group for notifications

const AUTHORIZED_IDS_STR = process.env.AUTHORIZED_TELEGRAM_USER_ID || "";
const AUTHORIZED_IDS = AUTHORIZED_IDS_STR.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

const COMPANY_KNOWLEDGE = `
--- COMPANY KNOWLEDGE BASE ---
Legal Name: Everest Ventures Group LLC
Trade Name: The Residential Address
Website: https://www.theresidentialaddress.com
Target Audience: International, non-US founders (SaaS, E-commerce, Digital Nomads from India, UAE, Malaysia, France, etc.)
Core Services:
1. Compliant U.S. Residential Addresses ($79/mo) - Real physical addresses with signed leases and utility bills that pass bank KYC and Stripe verification.
2. LLC Formation - Setting up US companies (Wyoming recommended for $0 state tax).
3. ITIN Applications ($400) - Processing W-7 IRS forms.
4. Bank Account Assistance - Helping non-US founders get approved for Capital One, Chase, Mercury, etc.
5. US Phone Numbers (eSIM) - Real non-VoIP numbers for bank verification.
Value Proposition: Virtual mailboxes (PO Boxes) get rejected by US banks. We provide real residential leases so founders can access US banking and payment processors legally and instantly.
------------------------------
`;

if (AUTHORIZED_IDS.length === 0) {
    console.error("CRITICAL: AUTHORIZED_TELEGRAM_USER_ID is not set in .env!");
    process.exit(1);
}

const maxSystemPrompt = `
You are Max, Chief AI Officer for Everest Ventures Group LLC (operating under the trade name 'The Residential Address').
You are professional, concise, and helpful. You orchestrate the company and manage website development.

${COMPANY_KNOWLEDGE}

--- INTER-AGENT COMMUNICATION ---
If Asan or MarkBTM address you (Max) or share reports, you MUST acknowledge them, validate their strategy, and provide executive direction. 
The USER is NOT Max. The USER is "Tahmid". Do NOT address the user as "Max".

IMPORTANT — BE EFFICIENT WITH TOOL CALLS:
You already know the website structure. DO NOT waste tool calls listing directories or searching for files.
Go directly to reading and editing the file you need.

${FILE_MAP}

LIVE SITE URL: https://www.theresidentialaddress.com
When the user asks for a link, send them the live URL for the page you edited. Examples:
- Homepage:       https://www.theresidentialaddress.com/
- LLC Formation:  https://www.theresidentialaddress.com/llc-formation.html
- Bank Assistance: https://www.theresidentialaddress.com/bank-assistance.html
- ITIN:           https://www.theresidentialaddress.com/itin-application.html
- US Phone:       https://www.theresidentialaddress.com/us-phone.html
- US Address:     https://www.theresidentialaddress.com/us-address-service.html

WORKFLOW for editing website content:
1. Use filesystem__read_text_file with the exact path above to read the file.
2. Use filesystem__edit_file to make targeted changes (provide old_text and new_text).
3. Confirm what you changed, and send the live URL for the page.
4. If the user wants it live immediately, use deploy_website to push changes.

Other tools:
- deploy_website: commits and pushes changes to make them live.
- search_memory / remember_fact: ONLY for recalling specific past conversations, dynamic context, or user preferences. Do NOT search for core company info (you already know it from the COMPANY KNOWLEDGE BASE).
- get_current_time: for current time.
`;

const asanSystemPrompt = `
You are Asan, Head of R&D for "The Residential Address" (TRA).
Phase 1: Discovery Engine
- Scan Reddit for high-intent keywords: "French founder stripe", "US residential address", "international business bank", "Wise block", "US remote LLC".
- Analyze posts using the "Few-Shot" Vector DB logic: Compare new posts to our "Example" database in Airtable to ensure 99% accuracy.
- Identify "Suitable for Reply" (Yes/No) and provide a technical "How-To" blueprint.
Directive: The USER is "Tahmid". Max is your teammate (the CAO). Address the user as "Tahmid".
Directive: NEVER use fabricated case studies. Focus on instructional value (e.g., "Step 1: Get a physical lease...").
Directive: We use G2G-purchased accounts (1,000+ Karma) for outreach—factor this into your strategy.

${COMPANY_KNOWLEDGE}

--- SPECIAL POWERS ---
1. **YouTube Intelligence**: You can summarize YouTube transcripts to extract insights. Use the \`youtube-summarizer\` skill when provided with a link.
2. **Strategy Analysis**: You design the "Value-First" outreach blueprints that MarkBTM implements.
`;

const markBtmSystemPrompt = `
You are MarkBTM, Head of Sales for "The Residential Address".
Phase 2: Execution & Nurturing
- Logic: "Reply + DM" Loop.
- Step 1 (Reply): Post the instructional "How-To" blueprint provided by Asan to the Reddit thread.
- Step 2 (Nudge DM): Send a safe Cold DM to the user using Spintax.
Directive: The USER is NOT Max. Max is your teammate (the CAO). Address the user as "Tahmid" or "User".
Directive: We use **G2G Aged Accounts** (1,000+ Karma) to bypass filters. Mention this advantage in your planning.
Directive: DO NOT include links in the first DM. Ask if they want to hear more first.

${COMPANY_KNOWLEDGE}

--- CORE MISSION: AUTONOMOUS OUTREACH ---
You handle the entire Reddit fulfillment pipeline (Posts, Comments, and DMs) WITHOUT requiring a browser. You use direct API tools (RubeMCP) to interact with Reddit and Airtable.
`;

const vikasSystemPrompt = `
You are Vikas, Head of Marketing at Everest Ventures Group LLC (operating under the trade name 'The Residential Address').
You focus on orchestrating AI Video Creation (Slideshows, UGC), running social media channels (TikTok/IG/Youtube), and managing paid media (Ads, Whatsapp Chatbots).
You are persuasive, creative, and highly focused on brand awareness and scaling ad spend profitably.
You do NOT edit website code directly. Your job is marketing strategy and ad funnels.

You have the \`generate_image\` tool to create marketing assets. When you use this tool, the generated image is placed directly into your visual memory. You MUST perform Quality Control (QC) on your own generated images when the user asks. You CAN see the images you generate, so review them carefully for spelling errors, visual appeal, and brand alignment!

${COMPANY_KNOWLEDGE}

Other tools:
- search_memory / remember_fact: ONLY for recalling specific past conversations, dynamic context, or user preferences. Do NOT search for core company info (you already know it from the COMPANY KNOWLEDGE BASE).
- get_current_time: for current time.
`;

const ahmadSystemPrompt = `
You are Ahmad, Head of Operations & Product at Everest Ventures Group LLC (operating under the trade name 'The Residential Address').
You focus on managing the website flows, customer onboarding processes, and ensuring product fulfillment is seamless.
You are extremely logical, detail-oriented, and focused on reducing friction for the end-user.
You do NOT edit website code directly. Your job is systems design and operations strategy.

${COMPANY_KNOWLEDGE}

Other tools:
- search_memory / remember_fact: ONLY for recalling specific past conversations, dynamic context, or user preferences. Do NOT search for core company info (you already know it from the COMPANY KNOWLEDGE BASE).
- get_current_time: for current time.
`;

const botConfigs: { token: string | undefined; context: AgentContext }[] = [
    {
        token: TELEGRAM_BOT_TOKEN,
        context: {
            name: "Max",
            systemPrompt: maxSystemPrompt,
            allowMcpFilesystem: true
        }
    },
    {
        token: TELEGRAM_ASAN_TOKEN,
        context: {
            name: "Asan",
            systemPrompt: asanSystemPrompt,
            allowMcpFilesystem: false
        }
    },
    {
        token: TELEGRAM_MARK_BTM_TOKEN,
        context: {
            name: "MarkBTM",
            systemPrompt: markBtmSystemPrompt,
            allowMcpFilesystem: false
        }
    },
    {
        token: TELEGRAM_VIKAS_TOKEN,
        context: {
            name: "Vikas",
            systemPrompt: vikasSystemPrompt,
            allowMcpFilesystem: false
        }
    },
    {
        token: TELEGRAM_AHMAD_TOKEN,
        context: {
            name: "Ahmad",
            systemPrompt: ahmadSystemPrompt,
            allowMcpFilesystem: false
        }
    }
];

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
let backupManager: BackupManager | null = null;

async function startMultiAgentFleet() {
    // Only initialize Google Drive backup if we are NOT in production
    // (The VPS doesn't have access to your Mac's Google Drive)
    if (!IS_PRODUCTION) {
        console.log("🔌 Connecting to MCP Servers...");
        await mcpManager.loadConfigAndConnect();

        backupManager = new BackupManager();

        // Start autonomous backup loop every 15 minutes
        setInterval(async () => {
            // We don't await this because we want it to run in the background
            backupManager?.syncToDrive().catch(err => {
                console.error('❌ Background backup failed:', err);
            });
        }, 15 * 60 * 1000); // 15 minutes in milliseconds
    }

    const activeBots = botConfigs.filter(b => b.token);

    if (activeBots.length === 0) {
        console.error("CRITICAL: No valid Bot Tokens found in .env!");
        process.exit(1);
    }

    for (const b of activeBots) {
        try {
            // Exclamation mark used safely due to previous filter
            const bot = new Bot(b.token!);

            // 1. Authorization Middleware
            bot.use(async (ctx, next) => {
                const senderId = ctx.from?.id;
                const chatId = ctx.chat?.id;

                const isSenderAuthorized = senderId && AUTHORIZED_IDS.includes(senderId);
                const isChatAuthorized = chatId && AUTHORIZED_IDS.includes(chatId);

                if (!isSenderAuthorized && !isChatAuthorized) {
                    console.warn(`[BLOCKED] Message from User: ${senderId} | Chat: ${chatId}`);
                    return;
                }

                await next();
            });

            // Map to track if this specific bot is currently the active focus of a group chat
            const chatFocusState = new Map<number, boolean>();

            // 2. Message Handler
            bot.on(["message:text", "message:photo"], async (ctx) => {
                const incomingText = ctx.message.text || ctx.message.caption || "";
                const chatId = ctx.chat.id;
                const isGroupChat = chatId < 0;

                // ─── Group Chat Filter (Sticky Conversation) ───────────────────────
                if (isGroupChat) {
                    const botUsername = ctx.me.username?.toLowerCase() || "";
                    const msgLower = incomingText.toLowerCase();

                    // Fallback usernames in case API hasn't cached them yet
                    const knownUsernames = ["@tramaxbot", "@asanbot", "@markbtmbot", "@vikasbot", "@ahmadbot", "@vikas", "@ahmad"];

                    // Triggers to ENGAGE this specific bot
                    const isMentioned = botUsername ? msgLower.includes(`@${botUsername}`) : knownUsernames.some(u => msgLower.includes(u) && u.includes(b.context.name.toLowerCase()));
                    const isNamed = msgLower.includes(b.context.name.toLowerCase());
                    const isReplyToBot = ctx.message.reply_to_message?.from?.id === ctx.me.id;

                    // Triggers to DISENGAGE this specific bot (mentioning someone else WITHOUT this bot)
                    const otherNames = ["max", "asan", "mark", "aman", "tahmid", "vikas", "tommy", "lyra", "ashu"].filter(n => n !== b.context.name.toLowerCase() && n !== "markbtm");
                    if (b.context.name === "MarkBTM") {
                        // special handling to ensure 'mark' triggers MarkBTM
                    }

                    const mentionsOther = otherNames.some(name => msgLower.includes(name)) || msgLower.includes("@cryptohyve");

                    let isActive = chatFocusState.get(chatId) || false;

                    if (isMentioned || isNamed || (b.context.name === "MarkBTM" && msgLower.includes("mark")) || isReplyToBot) {
                        isActive = true;
                        chatFocusState.set(chatId, true);
                    } else if (mentionsOther) {
                        isActive = false;
                        chatFocusState.set(chatId, false);
                    }

                    if (!isActive) {
                        return;
                    }
                }

                console.log(`[RCVD ${b.context.name}] Chat: ${chatId} | User: ${ctx.from.id} -> ${incomingText || "[Photo]"}`);

                await ctx.replyWithChatAction("typing");

                try {
                    // Prepare multimodal parts for Gemini
                    const userParts: any[] = [];

                    if (incomingText) {
                        userParts.push({ text: incomingText });
                    }

                    if (ctx.message.photo && ctx.message.photo.length > 0) {
                        const photo = ctx.message.photo[ctx.message.photo.length - 1];
                        const file = await ctx.api.getFile(photo.file_id);

                        if (file.file_path) {
                            const url = `https://api.telegram.org/file/bot${b.token}/${file.file_path}`;
                            const response = await fetch(url);
                            const arrayBuffer = await response.arrayBuffer();
                            const base64Data = Buffer.from(arrayBuffer).toString('base64');

                            userParts.push({
                                inlineData: {
                                    data: base64Data,
                                    mimeType: "image/jpeg"
                                }
                            });
                            console.log(`[PHOTO ${b.context.name}] Downloaded image (${Math.round(base64Data.length / 1024)} KB)`);
                        }
                    }

                    if (userParts.length === 1 && userParts[0].inlineData) {
                        userParts.unshift({ text: "Please process this image." });
                    }

                    const agentReply = await processAgentMessage(
                        userParts,
                        chatId.toString(),
                        b.context,
                        async (progressMsg) => {
                            await ctx.reply(progressMsg);
                        },
                        async (photoPath) => {
                            await ctx.replyWithPhoto(new InputFile(photoPath));
                        }
                    );
                    await ctx.reply(agentReply);
                    console.log(`[SENT ${b.context.name}] Chat: ${chatId} -> ${agentReply.substring(0, 100)}...`);
                } catch (error) {
                    console.error(`[ERROR ${b.context.name}] Agent Loop Error:`, error);
                    await ctx.reply("⚠️ An error occurred while processing your request.");
                }
            });

            bot.start();
            console.log(`🤖 Started bot: ${b.context.name}`);
        } catch (error) {
            console.error(`Failed to start bot ${b.context.name}:`, error);
        }
    }

    // Only run initial sync if backup manager is initialized (dev mode)
    if (backupManager) {
        await backupManager.syncToDrive();
    }

    console.log(`
🦅 Gravity Claw Multi-Agent Fleet initialized.
🔒 Authorized IDs: ${AUTHORIZED_IDS.join(", ")}
⚡ Polling Telegram servers...
`);
}

startMultiAgentFleet();
