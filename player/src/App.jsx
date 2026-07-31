import { Routes, Route } from "react-router-dom";
import { Row, Col } from "antd";
import Standby from "./pages/Standby";
import Home from "./pages/Home";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Standby />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
