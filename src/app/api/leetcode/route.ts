import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');

  if (!rawUsername) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  // Parse username
  let username = rawUsername.trim();
  username = username.replace(/^(https?:\/\/)?(www\.)?/, '');
  if (username.startsWith('leetcode.com/')) {
    username = username.replace(/^leetcode\.com\/(u\/)?/, '');
  }
  username = username.split('/')[0].split('?')[0].trim();

  try {
    const gqlQuery = `
      query leetcodeData($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            streak
            totalActiveDays
            submissionCalendar
          }
        }
        recentAcSubmissionList(username: $username, limit: 15) {
          id
          title
          titleSlug
          timestamp
        }
        userContestRanking(username: $username) {
          rating
          globalRanking
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({
        query: gqlQuery,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error(`LeetCode API responded with status ${response.status}`);
    }

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
      const isUserNotExist = result.errors.some((e: any) => e.message?.toLowerCase().includes('user') && e.message?.toLowerCase().includes('exist'));
      if (isUserNotExist) {
        return NextResponse.json({ error: 'LeetCode user does not exist' }, { status: 404 });
      }
      throw new Error(result.errors[0].message || 'LeetCode GraphQL error');
    }

    const data = result.data || {};
    const matchedUser = data.matchedUser;

    if (!matchedUser) {
      return NextResponse.json({ error: 'LeetCode user does not exist' }, { status: 404 });
    }

    const profile = matchedUser.profile || {};
    const submitStats = matchedUser.submitStats || { acSubmissionNum: [] };
    const userCalendar = matchedUser.userCalendar || {};
    const userContestRanking = data.userContestRanking || {};

    // Map solved difficulties
    const solvedStatsMap: Record<string, number> = {};
    if (Array.isArray(submitStats.acSubmissionNum)) {
      submitStats.acSubmissionNum.forEach((item: any) => {
        solvedStatsMap[item.difficulty.toLowerCase()] = item.count;
      });
    }

    // Map recent submissions
    const submissions = Array.isArray(data.recentAcSubmissionList)
      ? data.recentAcSubmissionList.map((sub: any) => ({
          title: sub.title,
          titleSlug: sub.titleSlug,
          timestamp: sub.timestamp
        }))
      : [];

    return NextResponse.json({
      username: matchedUser.username || username,
      realName: profile.realName || '',
      avatar: profile.userAvatar || '',
      ranking: profile.ranking || 0,
      github: '',
      linkedin: '',
      solved: {
        total: solvedStatsMap['all'] || 0,
        easy: solvedStatsMap['easy'] || 0,
        medium: solvedStatsMap['medium'] || 0,
        hard: solvedStatsMap['hard'] || 0
      },
      submissions: submissions,
      calendar: {
        streak: userCalendar.streak || 0,
        totalActiveDays: userCalendar.totalActiveDays || 0,
        submissionCalendar: userCalendar.submissionCalendar || '{}'
      },
      contest: {
        rating: userContestRanking.rating || 0,
        globalRanking: userContestRanking.globalRanking || 0,
        participation: []
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
