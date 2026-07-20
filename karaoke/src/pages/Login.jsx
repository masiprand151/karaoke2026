import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import api from "../utils/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      window.localStorage.setItem("user", JSON.stringify(res.user));
      window.localStorage.setItem("token", res.token);
      navigate("/");
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {error && <h3 className="error-text">{error}</h3>}
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Login</h2>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="login-button">
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
