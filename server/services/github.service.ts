import { ENV } from "../_core/env";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(token?: string) {
  return {
    Authorization: `Bearer ${token ?? ENV.githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
  defaultBranch: string;
  language: string | null;
  stargazersCount: number;
  openIssues: number;
  updatedAt: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  url: string;
  labels: string[];
  assignees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed" | "merged";
  url: string;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

export class GitHubService {
  private token: string;

  constructor(token?: string) {
    this.token = token ?? ENV.githubToken;
  }

  isConfigured(): boolean {
    return !!this.token;
  }

  /** Get authenticated user */
  async getCurrentUser() {
    const res = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: getHeaders(this.token),
    });
    if (!res.ok)
      throw new Error(`GitHub getCurrentUser failed: ${res.statusText}`);
    return res.json();
  }

  /** List repositories for authenticated user */
  async listRepos(
    type: "all" | "owner" | "public" | "private" = "all",
    sort: "updated" | "created" | "pushed" | "full_name" = "updated",
    perPage = 30
  ): Promise<GitHubRepo[]> {
    const res = await fetch(
      `${GITHUB_API_BASE}/user/repos?type=${type}&sort=${sort}&per_page=${perPage}`,
      { headers: getHeaders(this.token) }
    );
    if (!res.ok) throw new Error(`GitHub listRepos failed: ${res.statusText}`);
    const data = await res.json();
    return data.map((r: Record<string, unknown>) => ({
      id: r.id as number,
      name: r.name as string,
      fullName: r.full_name as string,
      description: r.description as string | null,
      private: r.private as boolean,
      url: r.html_url as string,
      defaultBranch: r.default_branch as string,
      language: r.language as string | null,
      stargazersCount: r.stargazers_count as number,
      openIssues: r.open_issues_count as number,
      updatedAt: r.updated_at as string,
    }));
  }

  /** List issues for a repo */
  async listIssues(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open"
  ): Promise<GitHubIssue[]> {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=${state}&per_page=50`,
      { headers: getHeaders(this.token) }
    );
    if (!res.ok) throw new Error(`GitHub listIssues failed: ${res.statusText}`);
    const data = await res.json();
    return data
      .filter((i: Record<string, unknown>) => !i.pull_request) // exclude PRs
      .map((i: Record<string, unknown>) => ({
        id: i.id as number,
        number: i.number as number,
        title: i.title as string,
        body: i.body as string | null,
        state: i.state as "open" | "closed",
        url: i.html_url as string,
        labels: ((i.labels as Array<{ name: string }>) ?? []).map(l => l.name),
        assignees: ((i.assignees as Array<{ login: string }>) ?? []).map(
          a => a.login
        ),
        createdAt: i.created_at as string,
        updatedAt: i.updated_at as string,
      }));
  }

  /** Create an issue */
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[],
    assignees?: string[]
  ): Promise<GitHubIssue> {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: getHeaders(this.token),
        body: JSON.stringify({ title, body, labels, assignees }),
      }
    );
    if (!res.ok)
      throw new Error(`GitHub createIssue failed: ${res.statusText}`);
    const i = await res.json();
    return {
      id: i.id,
      number: i.number,
      title: i.title,
      body: i.body,
      state: i.state,
      url: i.html_url,
      labels: (i.labels ?? []).map((l: { name: string }) => l.name),
      assignees: (i.assignees ?? []).map((a: { login: string }) => a.login),
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    };
  }

  /** List pull requests */
  async listPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open"
  ): Promise<GitHubPullRequest[]> {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}&per_page=50`,
      { headers: getHeaders(this.token) }
    );
    if (!res.ok) throw new Error(`GitHub listPRs failed: ${res.statusText}`);
    const data = await res.json();
    return data.map((pr: Record<string, unknown>) => ({
      id: pr.id as number,
      number: pr.number as number,
      title: pr.title as string,
      body: pr.body as string | null,
      state: (pr.merged_at ? "merged" : pr.state) as
        | "open"
        | "closed"
        | "merged",
      url: pr.html_url as string,
      draft: pr.draft as boolean,
      createdAt: pr.created_at as string,
      updatedAt: pr.updated_at as string,
    }));
  }

  /** Get repository stats */
  async getRepoStats(owner: string, repo: string) {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(this.token),
    });
    if (!res.ok)
      throw new Error(`GitHub getRepoStats failed: ${res.statusText}`);
    return res.json();
  }

  /** Test connection */
  async testConnection(): Promise<{
    ok: boolean;
    login?: string;
    error?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      return { ok: true, login: user.login };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const githubService = new GitHubService();
