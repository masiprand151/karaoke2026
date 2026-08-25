import { useEffect, useState } from "react";
import { testConnect } from "../services/test";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { BsGear } from "react-icons/bs";
import BaseModal from "../components/BaseModal";
import useStorage from "../hooks/useStorage";

export default function Login() {
  const [connected, setConnected] = useState(false);
  const [show, setShow] = useState(false);
  const [pin, setPin] = useState("");
  const [valid, setValid] = useState(false);
  const [setting, setSetting] = useStorage("setting");
  const [server, setServer] = useState(setting?.server);
  const [pc, setPc] = useState(setting?.pc);

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

  const handleChangePin = (e) => {
    const value = e.target.value;
    setPin(value);
    if (value === "110498") {
      setValid(true);
    }
  };

  const handleSaveSetting = () => {
    if (!valid) return;
    setSetting({
      server,
      pc,
    });

    setShow(false);
    setPin("");
    setValid("");
    setServer("");
    setPc("");
  };

  return (
    <>
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: 8,
          }}
        >
          <button
            className="btn btn-outline-dark"
            onClick={() => setShow(true)}
          >
            <BsGear size={25} />
          </button>
        </div>

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
                className="btn btn-primary w-100 mb-2"
                onClick={handleLogin}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-danger w-100"
                onClick={window.electron.closeApp}
              >
                Exit
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

      <BaseModal
        show={show}
        title={"Setting"}
        onClose={() => setShow(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShow(false);
                setPin("");
                setValid("");
                setServer("");
                setPc("");
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveSetting}
            >
              Save
            </button>
          </>
        }
      >
        {!valid && (
          <div className="mb-3">
            <label className="mb-2">Pin</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter Pin"
              value={pin}
              onChange={handleChangePin}
            />
          </div>
        )}

        {valid && (
          <>
            <div className="mb-3">
              <label className="mb-2">Server</label>
              <input
                type="text"
                className="form-control"
                placeholder="exemple: http://127.0.0.1:3000"
                value={server}
                onChange={(e) => setServer(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="mb-2">Computer Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Like for your computer"
                value={pc}
                onChange={(e) => setPc(e.target.value)}
              />
            </div>
          </>
        )}
      </BaseModal>
    </>
  );
}
