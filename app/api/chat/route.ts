import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message, manualId } = await request.json();

  // Simulate AI response with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return NextResponse.json({
    reply: `This is a simulated AI response to: "${message}". Based on the manual ${manualId}, you should ensure the machine is plugged in and the water reservoir is full.`
  });
}
