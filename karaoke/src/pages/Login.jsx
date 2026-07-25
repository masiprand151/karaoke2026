import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Flex,
  Popconfirm,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import api from "../utils/api";
import { useAlert } from "../contexts/AlertContext";
import { useConfirm } from "../contexts/ConfirmContext";

const { Title } = Typography;

function Login() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    const ok = await showConfirm({
      description: "Anda yakin ingin keluar aplikasi?",
    });

    if (ok) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.electron.closeApp();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        username,
        password,
      });

      window.localStorage.setItem("user", JSON.stringify(res.user));
      window.localStorage.setItem("token", res.token);

      showAlert({ type: "success", message: `Welcome ${res.user.username}` });
      navigate("/");
    } catch (error) {
      showAlert({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 10px 30px rgba(0,0,0,.12)",
          borderRadius: 12,
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Karaoke Billing
        </Title>

        <Form onSubmitCapture={handleLogin} layout="vertical">
          <Form.Item label="Username">
            <Input
              size="large"
              prefix={<UserOutlined />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </Form.Item>

          <Form.Item label="Password">
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </Form.Item>
          <Flex gap={"small"} vertical>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Login
            </Button>

            <Button danger size="large" block onClick={handleExit}>
              Exit
            </Button>
          </Flex>
        </Form>
      </Card>
    </Flex>
  );
}

export default Login;
