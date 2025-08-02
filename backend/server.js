import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5500;

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS middleware
app.use(cors({
  origin: "*", // Ha csak localhost:5174-ről jön, írd be: "http://localhost:5174"
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
}));

// Health check
app.get('/', (req, res) => {
  res.send('🏥 Hospital API is live');
});

// Search API endpoint
app.get('/api/search', (req, res) => {
  const q = req.query.q?.toLowerCase();
  const hospitalId = req.query.hospital;

  if (!q || !hospitalId) {
    return res.status(400).json({ error: "Missing query param `q` or `hospital`" });
  }

  let fileName;

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

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(500).json({ error: "Data file not found on server" });
  }

  const departments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const matches = departments.filter(d =>
    d.name.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    return res.status(404).json({ message: "No matching department found" });
  }

  res.json(matches);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
