import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/hospitals");
  };

  return (
    <div className="container">
      <h1>Welcome to the Hospital Guide 🏥</h1>
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}
