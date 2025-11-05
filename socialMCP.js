#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

class SocialMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "social-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "extract_github_repo_summary",
          description: "Extract summary information from a GitHub repository",
          inputSchema: {
            type: "object",
            properties: {
              repo_url: {
                type: "string",
                description: "GitHub repository URL (e.g., https://github.com/owner/repo)",
              },
            },
            required: ["repo_url"],
          },
        },
        {
          name: "post_to_instagram",
          description: "Send a POST request to Instagram API",
          inputSchema: {
            type: "object",
            properties: {
              access_token: {
                type: "string",
                description: "Instagram API access token",
              },
              message: {
                type: "string",
                description: "Post content/caption",
              },
              image_url: {
                type: "string",
                description: "URL of image to post (optional)",
              },
            },
            required: ["access_token", "message"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "extract_github_repo_summary":
          return await this.extractGitHubRepoSummary(args.repo_url);
        case "post_to_instagram":
          return await this.postToInstagram(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async extractGitHubRepoSummary(repoUrl) {
    try {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error("Invalid GitHub URL format");
      }

      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

      // https://api.github.com/repos/facebook/react-native.git

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              name: data.name,
              description: data.description,
              stars: data.stargazers_count,
              forks: data.forks_count,
              language: data.language,
              created_at: data.created_at,
              updated_at: data.updated_at,
              topics: data.topics,
              license: data.license?.name,
              open_issues: data.open_issues_count,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error extracting GitHub repo summary: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async postToInstagram(args) {
    try {
      const { access_token, message, image_url } = args;

      // Instagram Basic Display API endpoint for media creation
      const url = `https://graph.instagram.com/me/media`;

      const body = {
        caption: message,
        access_token: access_token,
      };

      if (image_url) {
        body.image_url = image_url;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Instagram API error: ${result.error?.message || response.status}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              media_id: result.id,
              message: "Post created successfully",
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error posting to Instagram: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Social MCP Server running on stdio");
  }
}

const server = new SocialMCPServer();
server.run().catch(console.error);