# Social MCP Server

A Model Context Protocol (MCP) server that provides tools for GitHub repository analysis and Instagram posting.

## Features

- **GitHub Repo Summary**: Extract repository information including stars, forks, language, and metadata
- **Instagram Posting**: Send posts to Instagram via API

## Docker Usage

### Build and Run Locally
```bash
docker build -t social-mcp-server .
docker run -it social-mcp-server
```

### Pull from Docker Hub
```bash
docker pull johndoeklein/social-mcp-server
docker run -it johndoeklein/social-mcp-server
```

## Publishing to Docker Hub

1. Build the image:
```bash
docker build -t johndoeklein/social-mcp-server .
```

2. Push to Docker Hub:
```bash
docker push johndoeklein/social-mcp-server
```

## Tools Available

### extract_github_repo_summary
- **Description**: Extract summary information from a GitHub repository
- **Parameters**: 
  - `repo_url` (required): GitHub repository URL

### post_to_instagram
- **Description**: Send a POST request to Instagram API
- **Parameters**:
  - `access_token` (required): Instagram API access token
  - `message` (required): Post content/caption
  - `image_url` (optional): URL of image to post

## Usage with AI Clients

This MCP server can be used with AI clients like Gemini by connecting to the Docker container via stdio transport.

## License

MIT