// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5500;
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET'],
  allowedHeaders: ['Content-Type'],
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Hospital → file mapping (ahogy írtad)
// 1 -> Eastbourne, 2 -> Conquest, 3 -> Royal Sussex (rsch)
const HOSPITAL_FILES = {
  "1": "eastbourne_hospital.json",
  "2": "conquest_hospital.json",
  "3": "rsch_departments.json",
};

app.use(cors({ origin: "*", methods: ["GET"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

// ---------- helpers
function normalizeToArray(json) {
  if (Array.isArray(json)) return json;

  if (json && typeof json === "object") {
    // RSCH formátum: { Departments:[...], Wards:[...] }
    if (json.Departments || json.Wards) {
      const a = Array.isArray(json.Departments) ? json.Departments : [];
      const b = Array.isArray(json.Wards) ? json.Wards : [];
      return [...a, ...b];
    }
    // Eastbourne/Conquest: { "Level 1":[...], "Level 2":[...], ... }
    const out = [];
    for (const v of Object.values(json)) {
      if (Array.isArray(v)) out.push(...v);
      else if (v && typeof v === "object") {
        for (const iv of Object.values(v)) if (Array.isArray(iv)) out.push(...iv);
      }
    }
    return out;
  }
  return [];
}

function safeLoad(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    try {
      return { ok: true, data: JSON.parse(raw) };
    } catch (e) {
      return { ok: false, error: `JSON parse error in ${path.basename(filePath)}: ${e.message}` };
    }
  } catch (e) {
    return { ok: false, error: `File read error for ${path.basename(filePath)}: ${e.message}` };
  }
}

function toUniform(items) {
  return items.map((it) => ({
    name: it.name || it.title || "Unknown",
    floor: it.floor || it.level || "",
    areaColor: it.areaColor || it.color || "",
    bestEntrance: it.bestEntrance || it.entrance || "",
    location: it.location || "",
    type: it.type || (it.location ? "Department" : "Area"),
  }));
}

function filePathFor(hospitalId) {
  const file = HOSPITAL_FILES[String(hospitalId)];
  return file ? path.join(__dirname, "data", file) : null;
}

// ---------- diagnostics on startup (answers your question)
(function verifyFiles() {
  console.log("🗂  Verifying JSON data files...");
  for (const [id, file] of Object.entries(HOSPITAL_FILES)) {
    const fp = path.join(__dirname, "data", file);
    const exists = fs.existsSync(fp);
    console.log(`  Hospital ${id} -> ${file} : ${exists ? "✅ found" : "❌ MISSING"}`);
  }
})();

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Hospital API", port: PORT, files: HOSPITAL_FILES });
});

// List dataset (debug)
app.get("/api/hospitals/:id", (req, res) => {
  const fp = filePathFor(req.params.id);
  if (!fp) return res.status(404).json({ message: "Invalid hospital ID" });
  if (!fs.existsSync(fp)) return res.status(500).json({ message: "Data file not found", filePath: fp });

  const loaded = safeLoad(fp);
  if (!loaded.ok) return res.status(500).json({ message: loaded.error });

  const items = toUniform(normalizeToArray(loaded.data));
  res.json({ count: items.length, sample: items.slice(0, 5) });
});

// Search
app.get("/api/search", (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase().trim();
  const hospital = (req.query.hospital || "").toString().trim();

  if (!q || !hospital) return res.status(400).json({ message: "Missing query param `q` or `hospital`" });

  const fp = filePathFor(hospital);
  if (!fp) return res.status(404).json({ message: "Invalid hospital ID" });
  if (!fs.existsSync(fp)) return res.status(500).json({ message: "Data file not found", filePath: fp });

  const loaded = safeLoad(fp);
  if (!loaded.ok) return res.status(500).json({ message: loaded.error });

  const items = toUniform(normalizeToArray(loaded.data));

  const fields = ["name", "floor", "areaColor", "bestEntrance", "location", "type"];
  const matches = items.filter((it) => fields.some((f) => String(it[f] || "").toLowerCase().includes(q)));

  res.json(matches); // üres tömb is 200
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});