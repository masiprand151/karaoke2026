import { useState, useEffect, useCallback } from "react";
import { data, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Tag,
  Space,
  Menu,
  Flex,
  Modal,
  Badge,
} from "antd";
import {
  LogoutOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HomeOutlined,
  AntDesignOutlined,
  MailOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  ReloadOutlined,
  MessageOutlined,
} from "@ant-design/icons";

import api from "../utils/api";
import { getRemainingTime } from "../utils/Time";
import { useConfirm } from "../contexts/ConfirmContext";
import useSetting from "../hooks/useSetting";
import Message from "../components/Messgae";
import { useNotification } from "../contexts/useNotification";
import { useSocket } from "../contexts/SocketContext";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  {
    label: "Room",
    key: "/admin/room",
    icon: <HomeOutlined />, // paket layanan
  },
  {
    label: "Packages",
    key: "/admin/package",
    icon: <AppstoreOutlined />, // paket layanan
  },
  {
    label: "Products",
    key: "/admin/fnb",
    icon: <ShoppingOutlined />, // produk/F&B
  },
  {
    label: "Ladies",
    key: "/admin/lady",
    icon: <TeamOutlined />, // lady companion
  },
  {
    label: "Songs",
    key: "/admin/songs",
    icon: <CustomerServiceOutlined />, // musik/lagu
  },
  {
    label: "User",
    key: "/admin/user",
    icon: <UserOutlined />, // manajemen user
  },
  {
    label: "Reload",
    key: "reload",
    icon: <ReloadOutlined />, // manajemen user
  },
];

function Home() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const { showConfirm } = useConfirm();
  const [current, setCurrent] = useState("mail");
  const { setting } = useSetting();
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const WARNING_TIME = 15 * 60 * 1000;
  const { socket, conected } = useSocket();

  // call
  useEffect(() => {
    if (!socket) return;
    const handleCall = (data) => {
      showConfirm({
        title: `${data.name} memanggil`,
        description: `${data.name} memanggil pada ${new Date(data.time).toLocaleTimeString()}`,
      });
    };

    socket.on("call-cashier", handleCall);

    return () => {
      socket.off("call-cashier", handleCall); // bersihkan listener
    };
  }, [socket]);

  const onSend = useCallback(
    (data) => {
      if (!socket) return;
      if (!selectedRoom || data.length === 0) return;

      const lastMsg = data[data.length - 1];

      socket.emit("reply-chat-room", {
        roomId: selectedRoom,
        name: rooms.find((r) => r.id === selectedRoom).name,
        message: lastMsg.text, // kirim objek pesan terakhir
      });
    },
    [socket, selectedRoom],
  );

  useEffect(() => {
    if (!socket) return;

    const handleChat = (msg) => {
      // normalisasi jadi array sekali saja
      const n = Array.isArray(msg) ? msg : [msg];
      const arr = n.map((m) => ({ ...m }));
      const last = msg[msg.length - 1];

      if (last.from !== "cashier") {
        setUnreadCount(
          (prev) => prev + msg.filter((f) => f.from !== "cashier").length,
        );
        showNotification(`Pesan baru ${last.from}`, last.text);
      }

      setMessages((prev) => {
        // hindari duplikat: cek apakah pesan sudah ada
        const newMsgs = arr.filter(
          (m) =>
            !prev.some(
              (p) =>
                p.text === m.text && p.from === m.from && p.roomId === m.roomId,
            ),
        );

        return [...prev, ...newMsgs];
      });
    };

    socket.on("chat", handleChat);

    return () => {
      socket.off("chat", handleChat);
    };
  }, [socket]);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/room");
      setRooms(res.rooms);
    } catch (err) {
      setError(err.message);
    }
  };

  const onClickMenu = (e) => {
    if (e.key === "reload") {
      window.location.reload();
    } else {
      navigate(e.key);
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
        <Title level={3} style={{ margin: 0, color: "white" }}>
          <AntDesignOutlined /> Karaoke Billing
        </Title>
        <Flex gap={"large"} justify="center" align="center">
          {JSON.parse(localStorage.getItem("user"))?.role === "admin" && (
            <Menu
              onClick={onClickMenu}
              selectedKeys={[current]}
              mode="horizontal"
              items={menuItems}
              style={{
                background: "transparent",
              }}
            />
          )}

          <Badge count={unreadCount} offset={[0, 5]}>
            <Button
              type="default"
              icon={<MessageOutlined />}
              onClick={() => {
                setOpen(true);
                setUnreadCount(0);
              }}
            />
          </Badge>

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
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
      <Message
        open={open}
        setOpen={setOpen}
        messages={messages}
        setMessages={setMessages}
        roomName={"cashier"}
        rooms={rooms}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        onSend={onSend}
      />
    </Layout>
  );
}

export default Home;
