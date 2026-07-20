import { Navigate } from "react-router-dom";

function Protected({ children }) {
  // misalnya cek user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user && !token) {
    // kalau tidak ada user, redirect ke login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;
