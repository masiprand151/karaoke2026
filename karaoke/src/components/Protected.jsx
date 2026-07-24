import { useEffect } from "react";
import { Navigate } from "react-router-dom";

function Protected({ children }) {
  // misalnya cek user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user && !token) {
    // kalau tidak ada user, redirect ke login
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    window.electron.on("app:closing", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // atau localStorage.clear();
      localStorage.clear();

      window.electron.appClosingDone();
    });
  }, []);

  return children;
}

export default Protected;
