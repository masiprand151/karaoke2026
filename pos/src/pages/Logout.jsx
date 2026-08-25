import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    auth.logout();
    // navigate("/");
    window.electron.closeApp();
  }, []);

  return null;
}
