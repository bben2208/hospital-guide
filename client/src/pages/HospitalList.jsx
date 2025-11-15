import HospitalButton from "../components/HospitalButton";

const hospitals = [
  { id: 1, name: "Eastbourne Hospital" },
  { id: 2, name: "Conquest Hospital" },
  { id: 3, name: "Royal Sussex County Hospital" },
  { id: 4, name: "Queen Victoria Hospital (East Grinstead)" }
];

export default function HospitalList() {
  return (
    <div className="container">
      <h1>Select a Hospital</h1>
      <div className="hospital-list">
        {hospitals.map((h) => (
          <HospitalButton key={h.id} hospital={h} />
        ))}
      </div>
    </div>
  );
}
