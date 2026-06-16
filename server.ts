import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory database for manuals
let manualsDb = [
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
    lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    sections: [
      {
        id: "t1",
        title: "Initial Setup",
        content: "Place the toaster on a flat, heat-resistant surface. Plug it into a grounded outlet.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioDescription: "The toaster is placed on a granite countertop and plugged into a standard wall outlet."
      },
      {
        id: "t2",
        title: "Toasting Bread",
        content: "Insert bread into the slots. Select your desired browning level using the dial (1-6). Press the lever down to start.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioDescription: "Two slices of bread are inserted. The dial is turned to level 3, and the side lever is pushed down until it clicks."
      }
    ]
  },
  {
    id: "demo-qr-789",
    productName: "SonicBuds Wireless Earbuds",
    manufacturer: "AudioSync",
    status: "Published",
    lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    sections: [
      {
        id: "e1",
        title: "Pairing with your Device",
        content: "1. Open the charging case lid.\n2. Go to Bluetooth settings on your device.\n3. Select 'SonicBuds' from the list of available devices.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioDescription: "The charging case is opened, revealing the earbuds. A smartphone screen shows the Bluetooth menu where 'SonicBuds' is tapped and connected."
      },
      {
        id: "e2",
        title: "Touch Controls",
        content: "Single tap: Play/Pause\nDouble tap right: Next track\nDouble tap left: Previous track\nLong press: Activate voice assistant",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioDescription: "A person taps the right earbud once to pause music, then double-taps it to skip to the next song."
      },
      {
        id: "e3",
        title: "Charging",
        content: "Place the earbuds back into the case. The LED indicator will pulse white while charging and turn solid white when fully charged.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioDescription: "Earbuds are placed into the magnetic slots of the case. A small LED on the front of the case begins to slowly pulse white."
      }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Get all manuals for manufacturer
  app.get("/api/manuals", (req, res) => {
    res.json(manualsDb);
  });

  // Get a specific manual
  app.get("/api/manuals/:id", (req, res) => {
    const { id } = req.params;
    const manual = manualsDb.find(m => m.id === id);
    if (manual) {
      res.json(manual);
    } else {
      res.status(404).json({ error: "Manual not found" });
    }
  });

  // Create a new manual
  app.post("/api/manuals", (req, res) => {
    const newManual = {
      ...req.body,
      id: `manual-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      status: "Draft"
    };
    manualsDb.push(newManual);
    res.status(201).json(newManual);
  });

  // Update a manual
  app.put("/api/manuals/:id", (req, res) => {
    const { id } = req.params;
    const index = manualsDb.findIndex(m => m.id === id);
    if (index !== -1) {
      manualsDb[index] = { ...manualsDb[index], ...req.body, lastUpdated: new Date().toISOString() };
      res.json(manualsDb[index]);
    } else {
      res.status(404).json({ error: "Manual not found" });
    }
  });

  // Delete a manual
  app.delete("/api/manuals/:id", (req, res) => {
    const { id } = req.params;
    manualsDb = manualsDb.filter(m => m.id !== id);
    res.status(204).send();
  });

  // Dummy Analytics Endpoint
  app.get("/api/manuals/:id/analytics", (req, res) => {
    const { id } = req.params;
    const manual = manualsDb.find(m => m.id === id);
    if (!manual) return res.status(404).json({ error: "Manual not found" });

    res.json({
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
  });

  // Dummy AI Chat Endpoint
  app.post("/api/chat", (req, res) => {
    const { message, manualId } = req.body;
    setTimeout(() => {
      res.json({
        reply: `This is a simulated AI response to: "${message}". Based on the manual ${manualId}, you should ensure the machine is plugged in and the water reservoir is full.`
      });
    }, 1000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
