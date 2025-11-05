#!/usr/bin/env node

async function testGitHubExtraction() {
  const repoUrl = "https://github.com/modelcontextprotocol/python-sdk";
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const summary = {
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
    };

    console.log("GitHub repo summary:");
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testGitHubExtraction();