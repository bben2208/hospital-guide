import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5500;

// fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: "http://localhost:5174",
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
}));

// basic health check
app.get('/', (req, res) => {
  res.send('🏥 Hospital API is live');
});

// smart search endpoint with dynamic hospital support
app.get('/api/search', (req, res) => {
  const q = req.query.q?.toLowerCase();
  const hospitalId = req.query.hospital;

  if (!q || !hospitalId) {
    return res.status(400).json({ error: "Missing query param `q` or `hospital`" });
  }

  let fileName = null;

  switch (hospitalId) {
    case "1":
      fileName = 'eastbourne_hospital.json';
      break;
    case "2":
      fileName = 'conquest_hospital.json';
      break;
      case "3":
        fileName = 'rsch_departments.json'; 
        break;
    default:
      return res.status(404).json({ error: "Invalid hospital ID" });
  }

  const filePath = path.join(__dirname, 'data', fileName);
  const departments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const matches = departments.filter(d =>
    d.name.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    return res.status(404).json({ message: "No matching department found" });
  }

  res.json(matches);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
