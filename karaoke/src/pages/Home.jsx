import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Typography, Row, Col, Card, Button, Tag, Space } from "antd";
import {
  LogoutOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import api from "../utils/api";
import { getRemainingTime } from "../utils/Time";
import { useConfirm } from "../contexts/ConfirmContext";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function Home() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const { showConfirm } = useConfirm();

  const navigate = useNavigate();

  const WARNING_TIME = 15 * 60 * 1000;

  const fetchRooms = async () => {
    try {
      const res = await api.get("/room");
      setRooms(res.rooms);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => {
          const session = room.sessions?.[0];

          return {
            ...room,
            remaining: {
              ...getRemainingTime(session?.start, session?.end),
            },
          };
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const ok = await showConfirm({
      description: "Anda yakin ingin keluar aplikasi?",
    });

    if (ok) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.electron.closeApp();
    }
  };

  const getCardColor = (room) => {
    if (
      room?.remaining?.remainingMs > 0 &&
      room.remaining.remainingMs <= WARNING_TIME
    ) {
      return "#faad14";
    }

    if (room.status === "used" && room?.remaining?.isExpired) {
      return "#ff4d4f";
    }

    if (room.status === "used") {
      return "#52c41a";
    }

    return "#1677ff";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingInline: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          🎤 Karaoke Billing
        </Title>

        <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
      </Header>

      <Content style={{ padding: 24 }}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Row gutter={[12, 12]}>
            {rooms.map((room) => (
              <Col xs={12} sm={8} md={6} lg={4} xl={3} xxl={3} key={room.id}>
                <Card
                  hoverable
                  size="small"
                  bodyStyle={{
                    padding: 12,
                  }}
                  onClick={() => {
                    if (room.status !== "used") {
                      navigate(`/checkin/${room.id}`);
                    } else {
                      navigate(`/preview/${room.sessions?.[0].id}`);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    borderTop: `5px solid ${getCardColor(room)}`,
                    borderRadius: 10,
                    height: 145,
                  }}
                >
                  <Space
                    direction="vertical"
                    size={12}
                    style={{ width: "100%" }}
                  >
                    <Space
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Tag color={room.status === "used" ? "green" : "blue"}>
                        {room.name} - {room.status}
                      </Tag>
                    </Space>

                    <Text
                      ellipsis={{ tooltip: room.sessions?.[0]?.customerName }}
                      style={{
                        width: 140,
                        display: "inline-block",
                        fontSize: 13,
                        verticalAlign: "middle",
                      }}
                    >
                      <UserOutlined /> {room.sessions?.[0]?.customerName || "-"}
                    </Text>

                    <Text style={{ fontSize: 13, fontWeight: 600 }}>
                      <ClockCircleOutlined />{" "}
                      {room.remaining?.remainingText ?? "--:--:--"}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {error && <Text type="danger">{error}</Text>}
        </Space>
      </Content>
    </Layout>
  );
}

export default Home;
