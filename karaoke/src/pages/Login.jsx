import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, Alert, Flex } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import api from "../utils/api";

const { Title } = Typography;

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

        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 20 }}
          />
        )}

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

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            Login
          </Button>
        </Form>
      </Card>
    </Flex>
  );
}

export default Login;
