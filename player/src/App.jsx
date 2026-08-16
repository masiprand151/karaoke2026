import { Routes, Route, useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
import Standby from "./pages/Standby";
import Home from "./pages/Home";
import "./index.css";
import { useSocket } from "./contexts/SocketContext";
import { useEffect } from "react";

function App() {
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !connected) return;

    const handleCheckin = (data) => {
      localStorage.setItem("data-checkin", JSON.stringify(data));

      navigate("/home", {
        replace: true,
        state: {
          maintenance: false,
          checkin: true,
        },
      });
    };

    const handleCheckout = () => {
      window.localStorage.removeItem("data-checkin");
      navigate("/", {
        replace: true,
        state: {
          maintenance: false,
          checkin: false,
        },
      });
    };

    socket.on("checkin", handleCheckin);
    socket.on("checkout", handleCheckout);

    return () => {
      socket.off("checkin", handleCheckin);
      socket.off("checkout", handleCheckout);
    };
  }, [socket, connected, navigate]);

  useEffect(() => {
    const data = JSON.parse(window.localStorage.getItem("data-checkin"));
    if (data) {
      navigate("/home", {
        replace: true,
        state: {
          maintenance: false,
          checkin: true,
        },
      });
    } else {
      navigate("/", {
        replace: true,
        state: {
          maintenance: false,
          checkin: false,
        },
      });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Standby />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
