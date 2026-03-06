import { mcpManager } from './src/tools/mcp.js';

async function listTools() {
    console.log("Connecting to MCP servers...");
    await mcpManager.loadConfigAndConnect();

    console.log("\nListing tools for RubeMCP:");
    const tools = await mcpManager.getAllTools();
    const rubeTools = tools.filter(t => t.serverName === 'RubeMCP');

    console.log(JSON.stringify(rubeTools, null, 2));
    process.exit(0);
}

listTools().catch(err => {
    console.error(err);
    process.exit(1);
});
