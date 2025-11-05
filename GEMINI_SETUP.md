# How to Use Social MCP Server with Google Gemini

This guide shows you how to connect your Social MCP Server to Google Gemini so it can use the GitHub repository analysis tool.

## Prerequisites

- Docker installed on your system
- Google Gemini access (Gemini Advanced or API access)

## Step 1: Pull the MCP Server Docker Image

```bash
docker pull johndoeklein/social-mcp-server
```

## Step 2: Run the MCP Server Container

```bash
docker run -d --name social-mcp-server johndoeklein/social-mcp-server
```

## Step 3: Configure Gemini to Use Your MCP Server

### Option A: Using Gemini Desktop App

1. Open Gemini Desktop application
2. Go to **Settings** → **Extensions** → **Model Context Protocol**
3. Click **Add Server**
4. Configure:
   - **Name**: `Social MCP Server`
   - **Command**: `docker`
   - **Arguments**: `["exec", "-i", "social-mcp-server", "node", "socialMCP.js"]`
   - **Environment Variables**: (leave empty)

### Option B: Using MCP Configuration File

Create `~/.config/mcp/servers.json`:

```json
{
  "mcpServers": {
    "social-mcp-server": {
      "command": "docker",
      "args": ["exec", "-i", "social-mcp-server", "node", "socialMCP.js"],
      "env": {}
    }
  }
}
```

## Step 4: Test the Connection

Ask Gemini:

```
"Can you extract information about this GitHub repository: https://github.com/microsoft/vscode"
```

Gemini should now be able to use your `extract_github_repo_summary` tool to analyze the repository and return:
- Repository name and description
- Star count and fork count
- Primary programming language
- License information
- Creation and last update dates
- Open issues count

## Available Tools

Your MCP server provides these tools to Gemini:

### 1. extract_github_repo_summary
- **Purpose**: Get detailed information about any GitHub repository
- **Input**: GitHub repository URL
- **Output**: JSON with repo stats, language, license, etc.

### 2. post_to_instagram
- **Purpose**: Post content to Instagram
- **Input**: Access token, message, optional image URL
- **Output**: Success confirmation with media ID

## Example Usage

Once connected, you can ask Gemini:

- "Analyze the React repository on GitHub"
- "Get stats for https://github.com/nodejs/node"
- "Compare the popularity of Vue.js and Angular repositories"

Gemini will automatically use your MCP server to fetch real-time GitHub data and provide comprehensive analysis.

## Troubleshooting

**Container not running?**
```bash
docker ps -a
docker start social-mcp-server
```

**Connection issues?**
- Ensure Docker container is running
- Check Gemini MCP server configuration
- Verify the server responds: `docker exec -i social-mcp-server node socialMCP.js`

## Repository

Full source code: https://github.com/Lcodeee/learnMCPServerNov2025