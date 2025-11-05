# Smart MCP Client with Gemini Integration

An intelligent client that uses Gemini AI to automatically decide which MCP tools to use based on user questions.

## Architecture

```
[Frontend] → [Smart Backend] → [Gemini AI] → [Tool Selection]
                ↓
           [MCP Server]
```

## Features

- **🤖 Smart Tool Selection**: Gemini automatically decides which tools to use
- **📊 GitHub Analysis**: Extract repository stats, stars, forks, language info
- **👥 Random Names**: Generate random first names for testing
- **📱 Instagram Posting**: Send posts to Instagram via API
- **🎨 Web Interface**: Clean, responsive frontend

## Quick Start

### 1. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Add your Gemini API key to .env
GEMINI_API_KEY=your_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Smart Client
```bash
node smartBackend.js
```

### 4. Open Frontend
Open your browser to: **http://localhost:5000**

## How It Works

1. **User asks a question** via the web interface
2. **Backend asks Gemini**: "Which tools do you need for this question?"
3. **Gemini decides** which MCP tools to use (if any)
4. **Backend executes** the selected tools
5. **Gemini provides** a comprehensive answer using the tool results

## Example Queries

- `"Analyze this repository: https://github.com/facebook/react"`
- `"Generate 5 random first names for testing"`
- `"What is JavaScript?"` (no tools needed)

## Available MCP Tools

### extract_github_repo_summary
- **Description**: Extract GitHub repository information
- **Auto-triggered**: When user mentions GitHub URLs or repository analysis

### get_random_first_names
- **Description**: Generate random first names
- **Auto-triggered**: When user asks for random names or name generation

### post_to_instagram
- **Description**: Post content to Instagram
- **Auto-triggered**: When user wants to post to Instagram

## Docker Deployment

### Build and Run MCP Server
```bash
docker build -t johndoeklein/social-mcp-server .
docker run -it johndoeklein/social-mcp-server
```

### Pull from Docker Hub
```bash
docker pull johndoeklein/social-mcp-server
```

## API Endpoints

- `POST /api/ask` - Send a question and get an AI-powered response
- `GET /api/tools` - List available MCP tools
- `GET /` - Web interface

## Technology Stack

- **Backend**: Node.js + Express
- **AI**: Google Gemini 2.0 Flash
- **MCP Server**: Anthropic MCP Protocol
- **Frontend**: Vanilla HTML/CSS/JavaScript

## License

MIT