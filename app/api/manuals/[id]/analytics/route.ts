import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    totalViews: 12450,
    activeUsers: 843,
    avgTimeSpent: "4m 12s",
    viewsOverTime: [
      { date: 'Mon', views: 1200 },
      { date: 'Tue', views: 1900 },
      { date: 'Wed', views: 1500 },
      { date: 'Thu', views: 2200 },
      { date: 'Fri', views: 2800 },
      { date: 'Sat', views: 3100 },
      { date: 'Sun', views: 2600 },
    ],
    topAIQueries: [
      { query: "How to descale?", count: 450 },
      { query: "Filter replacement", count: 320 },
      { query: "Error code E2", count: 210 },
      { query: "Water not heating", count: 180 },
    ]
  });
}
