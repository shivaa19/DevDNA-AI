import { NextResponse } from 'next/server';
import internships from '@/data/internships.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const remoteOnly = searchParams.get('remote') === 'true';

  let results = internships;

  if (remoteOnly) {
    results = results.filter((i) => i.location.toLowerCase().includes('remote'));
  }

  return NextResponse.json(results);
}
