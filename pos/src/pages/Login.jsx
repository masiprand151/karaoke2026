import { useEffect, useState } from "react";
import { testConnect } from "../services/test";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [connected, setConnected] = useState(false);

  const [data, setData] = useState({
    username: "",
    password: "",
  });
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await testConnect();
        setConnected(true);
        if (auth.isAuthenticated) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.log(error);
        setConnected(false);
      }
    })();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { message, success } = await auth.login(data);
    if (!success) {
      toast.error(message);
    }
    toast.success("Login successful");

    navigate("/dashboard");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm border-0" style={{ width: "400px" }}>
        <div className="card-body p-4">
          {/* Logo / Title */}
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">LOGIN</h3>

            <div className="text-muted">Cashier</div>
          </div>

          {/* Login Form */}
          <form>
            <div className="mb-3">
              <label className="form-label">Username</label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={data.username}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={data.password}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              onClick={handleLogin}
            >
              Login
            </button>
          </form>

          {/* Server Status */}
          <div className="text-center mt-4">
            <small className="text-muted">
              <span className={connected ? "text-success" : "text-danger"}>
                ●
              </span>{" "}
              {connected ? "Server connected" : "Server not connected"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
