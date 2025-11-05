# How to Use Social MCP Server with Claude Desktop

This guide shows you how to connect your Social MCP Server to Claude Desktop so it can use the GitHub repository analysis and Instagram posting tools.

## Prerequisites

- Docker installed on your system
- Claude Desktop app installed
- macOS, Windows, or Linux

## Step 1: Pull the MCP Server Docker Image

```bash
docker pull johndoeklein/social-mcp-server
```

## Step 2: Configure Claude Desktop

### macOS Configuration

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "social-mcp-server": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "johndoeklein/social-mcp-server"]
    }
  }
}
```

### Windows Configuration

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "social-mcp-server": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "johndoeklein/social-mcp-server"]
    }
  }
}
```

### Linux Configuration

Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "social-mcp-server": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "johndoeklein/social-mcp-server"]
    }
  }
}
```

## Step 3: Restart Claude Desktop

Close and reopen Claude Desktop app to load the new MCP server configuration.

## Step 4: Verify Connection

In Claude Desktop, you should see a small "plug" icon or MCP indicator showing that the server is connected.

## Step 5: Test the Tools

Ask Claude:

```
"Can you analyze this GitHub repository: https://github.com/facebook/react"
```

Claude should use your `extract_github_repo_summary` tool and return detailed repository information.

## Available Tools

### 1. extract_github_repo_summary
- **Purpose**: Analyze any GitHub repository
- **Usage**: "Get info about [GitHub URL]"
- **Returns**: Stars, forks, language, license, creation date, etc.

### 2. post_to_instagram
- **Purpose**: Post content to Instagram
- **Usage**: "Post to Instagram: [message]" (requires access token)
- **Returns**: Success confirmation with media ID

## Example Conversations

**GitHub Analysis:**
```
You: "Analyze the TypeScript repository on GitHub"
Claude: [Uses extract_github_repo_summary tool to get real-time data]
```

**Repository Comparison:**
```
You: "Compare the popularity of Next.js vs Nuxt.js repositories"
Claude: [Fetches data for both repos and provides comparison]
```

**Instagram Posting:**
```
You: "Post 'Hello World!' to Instagram"
Claude: [Uses post_to_instagram tool with your access token]
```

## Troubleshooting

### MCP Server Not Connecting
1. Check Docker is running: `docker --version`
2. Test image manually: `docker run -i --rm johndoeklein/social-mcp-server`
3. Verify config file syntax with JSON validator
4. Restart Claude Desktop completely

### Permission Issues
- Ensure Docker daemon is running
- Check file permissions on config file
- Try running Claude Desktop as administrator (Windows)

### Config File Not Found
Create the directory first:
- **macOS**: `mkdir -p ~/Library/Application\ Support/Claude`
- **Windows**: `mkdir %APPDATA%\Claude`
- **Linux**: `mkdir -p ~/.config/Claude`

## Advanced Configuration

### With Environment Variables
```json
{
  "mcpServers": {
    "social-mcp-server": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "johndoeklein/social-mcp-server"],
      "env": {
        "INSTAGRAM_TOKEN": "your_token_here"
      }
    }
  }
}
```

### With Persistent Container
```json
{
  "mcpServers": {
    "social-mcp-server": {
      "command": "docker",
      "args": ["exec", "-i", "social-mcp-container", "node", "socialMCP.js"]
    }
  }
}
```

First run: `docker run -d --name social-mcp-container johndoeklein/social-mcp-server tail -f /dev/null`

## Repository

Full source code: https://github.com/Lcodeee/learnMCPServerNov2025