import { useEffect, useState } from "react";
import { testConnect } from "../src/services/test";

export default function Login() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await testConnect();
        setConnected(true);
      } catch (error) {
        console.log(error);
        setConnected(false);
      }
    })();
  }, []);

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
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
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
