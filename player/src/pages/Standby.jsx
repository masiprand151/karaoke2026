import React, { useState, useRef } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Row,
  Col,
  Drawer,
  Flex,
} from "antd";
import { CloseOutlined, SettingOutlined } from "@ant-design/icons";
import NumberPad from "../components/NumberPad";
import { useAlert } from "../contexts/AlertContext";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function Standby() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const inputRef = useRef(null);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleNumberClick = (num) => setPin((prev) => prev + num);
  const handleClear = () => setPin("");
  const handleDelete = () => setPin((prev) => prev.slice(0, -1));
  const handleLogin = () => {
    if (pin === "1234") {
      showAlert({
        type: "success",
        message: "Login berhasil",
      });
      navigate("/home");
      setOpen(false);
      setPin("");
    } else {
      showAlert({
        type: "error",
        message: "PIN salah!",
      });
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setPin(e.target.value);
  };

  const handleClose = () => {
    if (pin === "1") {
      window.electron.closeApp();
    }
  };

  return (
    <Row style={{ height: "100vh" }} id="left-panel">
      {/* Kolom kiri */}
      <Col
        span={12}
        style={{
          background: "radial-gradient(circle, #001529, #000)",
        }}
      >
        {/* Tombol login di kiri atas */}
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <Button
            type="primary"
            onClick={() => {
              setOpen(true);
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 0);
            }}
          >
            <SettingOutlined />
          </Button>
        </div>

        {/* Drawer login di sisi kiri */}
        <Drawer
          title="Login Room"
          placement="left"
          open={open}
          onClose={() => setOpen(false)}
          width={1024}
          style={{
            background: "radial-gradient(circle, #001529, #000)",
          }}
          closeIcon={<CloseOutlined style={{ color: "white", fontSize: 20 }} />}
        >
          <Flex vertical style={{ padding: "10% 30%" }}>
            <Title level={5}>Masukkan PIN</Title>
            <Input.Password
              ref={inputRef}
              value={pin}
              style={{ marginBottom: 16 }}
              placeholder="PIN"
              onChange={handleChange}
              autoFocus
            />

            <NumberPad value={pin} onChange={setPin} inputRef={inputRef} />
            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              onClick={handleLogin}
            >
              Maintenance
            </Button>
            <Button
              block
              style={{ marginTop: 16, background: "black", color: "#fff" }}
            >
              Restart
            </Button>
            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              onClick={handleClose}
              danger
            >
              Exit
            </Button>
          </Flex>
        </Drawer>
      </Col>

      {/* Kanan: video */}
      <Col span={12} style={{ background: "#fff" }}>
        <video
          key={"wallpaper"}
          src={`http://127.0.0.1:8765/wallpaper`}
          autoPlay
          controls
          loop
          playsInline
          muted
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            background: "black",
          }}
        />
      </Col>
    </Row>
  );
}
