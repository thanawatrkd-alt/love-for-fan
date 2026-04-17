import { describe, it, expect } from "vitest";

describe("Groq API Integration", () => {
  it("should validate Groq API key by making a test request", async () => {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }

    // Test Groq API with a simple request
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
      },
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should validate GitHub token by making a test request", async () => {
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN environment variable is not set");
    }

    // Test GitHub API with a simple request
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("login");
  });
});
