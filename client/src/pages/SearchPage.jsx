import { useParams, Link } from "react-router-dom";
import { useState } from "react";


export default function SearchPage() {
  const { hospitalId } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    const value = e.target.value.toLowerCase();
    setQuery(value);
    setError("");
    setResults([]);
  
    if (value.length < 2) return;
  
    try {
        const res = await fetch(`/api/search?q=${value}&hospital=${hospitalId}`);

  
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Something went wrong");
        return;
      }
  
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Server error. Please try again.");
      console.error("❌ Error:", err);
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

      <ul style={{ marginTop: "1rem", padding: "1rem" }}>
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
      }}
    >
      <strong style={{ fontSize: "1.1rem" }}>{item.name}</strong>
      <br />
      <span>Floor: {item.floor}</span>
      <br />
      <span>
        Area:{" "}
        <span style={{ color: item.areaColor.toLowerCase(), fontWeight: "bold" }}>
          {item.areaColor}
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
