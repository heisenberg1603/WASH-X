import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
const initData = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({
      employees: [],
      attendance: [],
      settings: {
        location: { lat: 1.3521, lng: 103.8198 }, // Default to Singapore center
        radiusMeters: 100,
        businessName: "MR.WASH X"
      }
    }, null, 2));
  }
};

async function startServer() {
  await initData();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/data', async (req, res) => {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.post('/api/employees', async (req, res) => {
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    const newEmployee = {
      id: crypto.randomUUID(),
      name: req.body.name,
      role: req.body.role || 'Washer',
      phone: req.body.phone,
      createdAt: new Date().toISOString()
    };
    data.employees.push(newEmployee);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(newEmployee);
  });

  app.post('/api/attendance', async (req, res) => {
    const { employeeId, lat, lng } = req.body;
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    
    // Simple distance calculation (Haversine-ish or just simple Euclidean for small distances)
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // in metres
    };

    const dist = getDistance(lat, lng, data.settings.location.lat, data.settings.location.lng);
    
    if (dist > data.settings.radiusMeters) {
      return res.status(400).json({ error: 'You are too far from the car wash location.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existing = data.attendance.find((a: any) => a.employeeId === employeeId && a.date === today);

    if (existing) {
      return res.status(400).json({ error: 'Attendance already marked for today.' });
    }

    const newEntry = {
      id: crypto.randomUUID(),
      employeeId,
      date: today,
      timestamp: new Date().toISOString(),
      location: { lat, lng },
      distance: dist
    };

    data.attendance.push(newEntry);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(newEntry);
  });

  app.post('/api/settings', async (req, res) => {
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    data.settings = { ...data.settings, ...req.body };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(data.settings);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
