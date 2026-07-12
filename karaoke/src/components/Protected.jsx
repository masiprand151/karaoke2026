import { Navigate } from "react-router-dom";

function Protected({ children }) {
  // misalnya cek user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    // kalau tidak ada user, redirect ke login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;
