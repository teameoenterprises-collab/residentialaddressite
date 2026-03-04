import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "fs/promises";
import path from "path";

// Define the shape of our mcp_config.json
interface MCPServerConfig {
    command: string;
    args: string[];
    env?: Record<string, string>;
}

interface MCPConfig {
    mcpServers: Record<string, MCPServerConfig>;
}

export class MCPManager {
    private clients: Map<string, Client> = new Map();

    async loadConfigAndConnect() {
        try {
            const configPath = path.resolve(process.cwd(), "mcp_config.json");
            const configData = await fs.readFile(configPath, 'utf8');
            const config: MCPConfig = JSON.parse(configData);

            console.log(`🔌 Discovered ${Object.keys(config.mcpServers).length} MCP Server(s) in config.`);

            for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
                await this.connectToServer(serverName, serverConfig);
            }
        } catch (error) {
            console.error("⚠️ Failed to load or parse mcp_config.json", error);
        }
    }

    private async connectToServer(name: string, config: MCPServerConfig) {
        console.log(`Connecting to MCP Server: [${name}]...`);

        // Ensure env var typing is strictly Record<string, string> for Stdio
        const safeEnv: Record<string, string> = {};
        for (const [k, v] of Object.entries(process.env)) {
            if (v !== undefined) safeEnv[k] = v;
        }
        if (config.env) {
            for (const [k, v] of Object.entries(config.env)) {
                safeEnv[k] = v;
            }
        }

        // 1. Setup Stdio transport
        const transport = new StdioClientTransport({
            command: config.command,
            args: config.args,
            env: safeEnv
        });

        // 2. Instantiate MCP Client
        const client = new Client(
            { name: `gravity-claw-${name}-client`, version: "1.0.0" }
        );

        // 3. Connect!
        try {
            await client.connect(transport);
            this.clients.set(name, client);
            console.log(`✅ Successfully connected to MCP: ${name}`);
        } catch (error) {
            console.error(`❌ Failed to connect to MCP: ${name}`, error);
        }
    }

    // Pass an MCP Call dynamically to the correct server
    async executeTool(serverName: string, toolName: string, args: any) {
        const client = this.clients.get(serverName);
        if (!client) throw new Error(`MCP Client ${serverName} not connected.`);

        try {
            const result = await client.callTool({
                name: toolName,
                arguments: args
            });
            return result;
        } catch (error) {
            console.error(`Error executing tool ${toolName} on ${serverName}:`, error);
            throw error;
        }
    }

    // Retrieve all tools across all connected MCP servers to inject into Gemini
    async getAllTools() {
        const allTools: any[] = [];

        for (const [serverName, client] of this.clients.entries()) {
            try {
                const response = await client.listTools();
                for (const tool of response.tools) {
                    // We prefix the tool name with the server name so we know where to route it when Gemini calls it
                    allTools.push({
                        serverName,
                        originalName: tool.name,
                        // Gemini tool format
                        geminiTool: {
                            name: `${serverName}__${tool.name.replace(/-/g, '_')}`, // Sanitize for Gemini limits
                            description: tool.description,
                            parameters: tool.inputSchema
                        }
                    });
                }
            } catch (err) {
                console.error(`Failed to list tools for ${serverName}`, err);
            }
        }
        return allTools;
    }
}

// Export a singleton instance of the manager
export const mcpManager = new MCPManager();
