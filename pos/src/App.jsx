import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Logout from "./pages/Logout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
