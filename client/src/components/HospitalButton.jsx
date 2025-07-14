import { useNavigate } from "react-router-dom";

export default function HospitalButton({ hospital }) {
  const navigate = useNavigate();

  return (
    <button
      className="hospital-btn"
      onClick={() => navigate(`/search/${hospital.id}`)}
    >
      {hospital.name}
    </button>
  );
}
