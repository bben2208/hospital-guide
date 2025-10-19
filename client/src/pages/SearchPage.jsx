//SearchPage.jsx
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api";

export default function SearchPage() {
  const { hospitalId } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

 // SearchPage.jsx (csak a handleSearch elejét mutatom)
const handleSearch = async (e) => {
  const value = e.target.value.toLowerCase();
  setQuery(value);
  setError("");
  setResults([]);


  if (value.trim().length < 2) return;

  // 🔧 tisztított hospitalId: csak az első számcsoportot engedjük
  const cleanHospitalId = String(hospitalId || "").match(/\d+/)?.[0] || "";

  try {
    const url = `/api/search?q=${encodeURIComponent(value)}&hospital=${encodeURIComponent(cleanHospitalId)}`;
    const res = await api(url);
    if (!res.ok) {
      const text = await res.text();
      let message = `Server error (${res.status})`;
      try {
        const maybeJson = JSON.parse(text);
        if (maybeJson?.message) message = maybeJson.message;
      } catch {}
      setError(message);
      return;
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Expected JSON, got: ${ct || "unknown"} — preview: ${text.slice(0, 80)}...`);
    }

    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("❌ Error:", err);
    setError("Server error. Please try again.");
  }
};

  return (
    <div
      className="container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "1.5rem" }}>What are you looking for? 🏥</h1>

      <input
        type="text"
        placeholder="Search ward or department..."
        value={query}
        onChange={handleSearch}
        style={{
          textTransform: "lowercase",
          padding: "0.75rem 1rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          width: "100%",
          maxWidth: "400px",
        }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ marginTop: "1rem", padding: "1rem", width: "100%", maxWidth: 500 }}>
        {results.map((item, i) => (
          <li
            key={i}
            style={{
              listStyle: "none",
              background: "#ffffff",
              padding: "1rem",
              borderRadius: "10px",
              marginBottom: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              textAlign: "left",
            }}
          >
            <strong style={{ fontSize: "1.1rem" }}>{item.name}</strong>
            <br />
            {item.bestEntrance && (
              <>
                <span>Best entrance: {item.bestEntrance}</span>
                <br />
              </>
            )}
            <span>Floor: {item.floor || "—"}</span>
            <br />
            <span>
              Area:{" "}
              <span
                style={{
                  color: (item.areaColor || "").toLowerCase(),
                  fontWeight: "bold",
                }}
              >
                {item.areaColor || "—"}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <Link
        to="/hospitals"
        style={{
          marginTop: "2rem",
          display: "inline-block",
          color: "#007bff",
          textDecoration: "underline",
          fontWeight: "500",
        }}
      >
        ⬅️ Back to Hospitals
      </Link>
    </div>
  );
}