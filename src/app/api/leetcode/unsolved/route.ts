import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Helper to parse username, same as in main route
const parseUsername = (input: string): string => {
  let name = input.trim();
  name = name.replace(/^(https?:\/\/)?(www\.)?/, '');
  if (name.startsWith('leetcode.com/')) {
    name = name.replace(/^leetcode\.com\/(u\/)?/, '');
  }
  name = name.split('/')[0].split('?')[0].trim();
  return name;
};

// Fetch solved problem IDs for a user
const fetchSolvedProblemIds = async (username: string): Promise<Set<string>> => {
  const gql = `
    query solvedIds($username: String!) {
      matchedUser(username: $username) {
        solvedProblems: problemsSolved {
          id
        }
      }
    }
  `;
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com/',
    },
    body: JSON.stringify({ query: gql, variables: { username } })
  });
  if (!res.ok) throw new Error('Failed to fetch solved IDs');
  const json = await res.json();
  const ids = (json.data?.matchedUser?.solvedProblems ?? []).map((p: any) => p.id);
  return new Set(ids);
};

// Fetch Striver A2Z Roadmap problems from local JSON
const getStriverA2ZProblems = async (): Promise<Array<{ id: string; title: string; titleSlug: string; difficulty: string }>> => {
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'striver_a2z.json');
    const fileContent = await fs.readFile(jsonPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to load striver_a2z.json:', error);
    return [];
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');
  if (!rawUsername) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }
  const username = parseUsername(rawUsername);
  try {
    const solvedIds = await fetchSolvedProblemIds(username);
    const roadmap = await getStriverA2ZProblems();
    const unsolved = roadmap.filter(p => !solvedIds.has(p.id)).slice(0, 5);
    return NextResponse.json({ unsolved, source: "Striver's A2Z Roadmap" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
