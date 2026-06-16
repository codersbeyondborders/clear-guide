import { NextResponse } from 'next/server';

// Fetch all manuals from the route
async function getManualsDb() {
  // This is a simplified approach - in production, use a real database
  // For now, we'll reference the in-memory data from the parent route
  return fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/manuals`).then(r => r.json()).catch(() => []);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // In a real app, fetch from database
  // For demo, we'll use hardcoded data
  const manuals = [
    {
      id: "demo-qr-123",
      productName: "Smart Coffee Maker X1",
      manufacturer: "BrewTech",
      status: "Published",
      lastUpdated: new Date().toISOString(),
      sections: [
        {
          id: "s1",
          title: "Getting Started",
          content: "Welcome to your new Smart Coffee Maker. Before first use, please wash all removable parts with warm soapy water.",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          audioDescription: "A person is shown washing the water reservoir and filter basket in a sink with warm, soapy water."
        },
        {
          id: "s2",
          title: "Brewing Coffee",
          content: "1. Add coffee grounds to the filter.\n2.Fill the reservoir with fresh water.\n3. Press the 'Brew' button.",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          audioDescription: "The water reservoir is filled to the max line. Two scoops of coffee are added to the filter. The brew button on the front panel is pressed, and it lights up."
        },
        {
          id: "s3",
          title: "Cleaning & Maintenance",
          content: "Descale the machine every 3 months. Wipe the exterior with a damp cloth.",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          audioDescription: "A damp cloth is used to wipe the stainless steel exterior of the coffee maker."
        }
      ]
    },
    {
      id: "demo-qr-456",
      productName: "Smart Toaster Pro",
      manufacturer: "BrewTech",
      status: "Draft",
      lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
      sections: []
    },
    {
      id: "demo-qr-789",
      productName: "SonicBuds Wireless Earbuds",
      manufacturer: "AudioSync",
      status: "Published",
      lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString(),
      sections: []
    }
  ];

  const manual = manuals.find(m => m.id === id);
  
  if (manual) {
    return NextResponse.json(manual);
  }
  
  return NextResponse.json({ error: "Manual not found" }, { status: 404 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // In a real app, update in database
  // For demo, return the updated manual
  return NextResponse.json({
    ...body,
    id,
    lastUpdated: new Date().toISOString()
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // In a real app, delete from database
  return NextResponse.json({ success: true }, { status: 204 });
}
