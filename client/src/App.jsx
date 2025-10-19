//App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import HospitalList from "./pages/HospitalList";
import SearchPage from "./pages/SearchPage";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<HospitalList />} />  
  <Route path="/hospitals" element={<HospitalList />} />
  <Route path="/search/:hospitalId" element={<SearchPage />} />
      </Routes>
    </div>
  );
}

export default App;
