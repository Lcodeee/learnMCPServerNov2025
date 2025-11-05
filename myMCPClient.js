#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import dotenv from "dotenv";

dotenv.config();

class MCPGeminiClient {
  constructor() {
    this.mcpClient = null;
    this.serverProcess = null;
  }

  async connectToMCPServer() {
    // Start MCP server from Docker container
    this.serverProcess = spawn("docker", ["run", "-i", "--rm", "johndoeklein/social-mcp-server"]);
    
    const transport = new StdioClientTransport({
      stdin: this.serverProcess.stdin,
      stdout: this.serverProcess.stdout
    });

    this.mcpClient = new Client(
      {
        name: "gemini-mcp-client",
        version: "1.0.0"
      },
      {
        capabilities: {}
      }
    );

    await this.mcpClient.connect(transport);
    console.log("Connected to MCP server via Docker");
  }

  async callMCPTool(toolName, args = {}) {
    try {
      const result = await this.mcpClient.request({
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args
        }
      });
      return result.content[0].text;
    } catch (error) {
      throw new Error(`MCP tool error: ${error.message}`);
    }
  }

  async sendToGemini(prompt, mcpData = null) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in .env file");
    }

    let fullPrompt = prompt;
    if (mcpData) {
      fullPrompt = `${prompt}\n\nAdditional data from MCP server:\n${mcpData}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async processQuery(query) {
    // Detect if query needs MCP tools
    if (query.includes("github.com") || query.toLowerCase().includes("repository")) {
      const repoMatch = query.match(/https:\/\/github\.com\/[^\s]+/);
      if (repoMatch) {
        console.log("Fetching GitHub repo data...");
        const repoData = await this.callMCPTool("extract_github_repo_summary", {
          repo_url: repoMatch[0]
        });
        return await this.sendToGemini(query, repoData);
      }
    }

    if (query.toLowerCase().includes("random names") || query.toLowerCase().includes("first names")) {
      const numberMatch = query.match(/(\d+)/);
      const count = numberMatch ? parseInt(numberMatch[1]) : 5;
      console.log(`Fetching ${count} random names...`);
      const namesData = await this.callMCPTool("get_random_first_names", {
        howMany: count
      });
      return await this.sendToGemini(query, namesData);
    }

    // No MCP tools needed, send directly to Gemini
    return await this.sendToGemini(query);
  }

  async close() {
    if (this.mcpClient) {
      await this.mcpClient.close();
    }
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// CLI interface
async function main() {
  const client = new MCPGeminiClient();
  
  try {
    await client.connectToMCPServer();
    
    const query = process.argv[2];
    if (!query) {
      console.log("Usage: node myMCPClient.js 'your question here'");
      process.exit(1);
    }

    console.log("Processing query:", query);
    const response = await client.processQuery(query);
    console.log("\nGemini Response:");
    console.log(response);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}