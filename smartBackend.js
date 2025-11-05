#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

class SmartMCPClient {
  constructor() {
    this.serverProcess = null;
    this.requestId = 1;
    this.availableTools = [];
  }

  async startMCPServer() {
    console.log('🚀 Starting MCP Server via Docker...');
    this.serverProcess = spawn('docker', ['run', '-i', '--rm', 'johndoeklein/social-mcp-server']);
    
    // Initialize and get available tools
    await this.initializeServer();
    await this.getAvailableTools();
  }

  async initializeServer() {
    const initMsg = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "smart-client", version: "1.0.0" }
      }
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MCP server initialization timeout'));
      }, 10000);
      
      this.serverProcess.stderr.on('data', (data) => {
        console.error('MCP Server Error:', data.toString());
      });
      
      this.serverProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`MCP Server process error: ${error.message}`));
      });
      
      this.serverProcess.stdin.write(JSON.stringify(initMsg) + '\n');
      
      this.serverProcess.stdout.once('data', (data) => {
        clearTimeout(timeout);
        try {
          const response = JSON.parse(data.toString().trim());
          if (response.result) {
            console.log('✅ MCP Server initialized');
            resolve();
          } else {
            reject(new Error(`MCP server init failed: ${JSON.stringify(response)}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse MCP response: ${parseError.message}`));
        }
      });
    });
  }

  async getAvailableTools() {
    const toolsMsg = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/list",
      params: {}
    };

    return new Promise((resolve, reject) => {
      this.serverProcess.stdin.write(JSON.stringify(toolsMsg) + '\n');
      
      this.serverProcess.stdout.once('data', (data) => {
        const response = JSON.parse(data.toString().trim());
        if (response.result) {
          this.availableTools = response.result.tools;
          console.log(`📋 Found ${this.availableTools.length} available tools`);
          resolve();
        } else {
          reject(new Error('Failed to get tools list'));
        }
      });
    });
  }

  async callTool(toolName, args) {
    const toolMsg = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    return new Promise((resolve, reject) => {
      this.serverProcess.stdin.write(JSON.stringify(toolMsg) + '\n');
      
      this.serverProcess.stdout.once('data', (data) => {
        const response = JSON.parse(data.toString().trim());
        if (response.result) {
          resolve(response.result.content[0].text);
        } else {
          reject(new Error(response.error?.message || 'Tool call failed'));
        }
      });
    });
  }

  async askGeminiAboutTools(userQuestion) {
    const toolsDescription = this.availableTools.map(tool => 
      `- ${tool.name}: ${tool.description}`
    ).join('\n');

    const prompt = `Available tools:
${toolsDescription}

User asked: "${userQuestion}"

Do you need any of these tools to answer this question? If yes, which tool(s) and with what parameters?

Return ONLY a JSON response in this format:
{
  "needTools": true/false,
  "toolCalls": [{"name": "tool_name", "args": {...}}],
  "reasoning": "brief explanation"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt
    });
    const responseText = response.text;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { needTools: false, toolCalls: [], reasoning: "No tools needed" };
  }

  async processQuestion(userQuestion) {
    console.log(`\n🤔 Processing: "${userQuestion}"`);
    
    // Ask Gemini what tools it needs
    const toolDecision = await this.askGeminiAboutTools(userQuestion);
    console.log(`🧠 Gemini decision:`, toolDecision);
    
    let toolResults = [];
    
    // Execute tools if needed
    if (toolDecision.needTools && toolDecision.toolCalls.length > 0) {
      console.log(`🔧 Executing ${toolDecision.toolCalls.length} tool(s)...`);
      
      for (const toolCall of toolDecision.toolCalls) {
        try {
          const result = await this.callTool(toolCall.name, toolCall.args);
          toolResults.push({
            tool: toolCall.name,
            result: result
          });
          console.log(`✅ Tool ${toolCall.name} executed successfully`);
        } catch (error) {
          console.error(`❌ Tool ${toolCall.name} failed:`, error.message);
        }
      }
    }
    
    // Get final answer from Gemini
    let finalPrompt = `User asked: "${userQuestion}"`;
    
    if (toolResults.length > 0) {
      const toolData = toolResults.map(tr => 
        `Tool ${tr.tool} returned: ${tr.result}`
      ).join('\n\n');
      
      finalPrompt += `\n\nI used tools and got this information:\n${toolData}\n\nPlease provide a comprehensive answer using this data.`;
    }
    
    const finalResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: finalPrompt
    });
    return finalResponse.text;
  }
}

// Initialize MCP client
const mcpClient = new SmartMCPClient();

// API Routes
app.post('/api/ask', async (req, res) => {
  try {
    console.log('Received question request:', req.body);
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('Processing question:', question);
    const answer = await mcpClient.processQuestion(question);
    console.log('Got answer:', answer);
    
    res.json({ 
      question,
      answer,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing question:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tools', (req, res) => {
  res.json({ tools: mcpClient.availableTools });
});

// Start server
async function startServer() {
  console.log('=== STARTING SERVER ===');
  
  // Start Express server first, then MCP in background
  app.listen(PORT, () => {
    console.log(`\n🌐 Smart MCP Backend running on http://localhost:${PORT}`);
    console.log(`🎨 Frontend available at: http://localhost:${PORT}`);
    console.log(`📡 API endpoint: POST /api/ask`);
    console.log(`🔧 Tools endpoint: GET /api/tools`);
  });
  
  // Initialize MCP in background
  try {
    console.log('Starting MCP client in background...');
    await mcpClient.startMCPServer();
    console.log('MCP client started successfully');
  } catch (error) {
    console.error('MCP startup failed:', error.message);
    // Don't exit - let server run without MCP for debugging
  }
}

startServer();