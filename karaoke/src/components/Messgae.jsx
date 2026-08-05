import { Drawer, Button, List, Input, Select, Flex, Typography } from "antd";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";

const { Title } = Typography;

export default function Message({
  setOpen,
  open,
  messages,
  setMessages,
  roomName,
  rooms,
  selectedRoom,
  setSelectedRoom,
  onSend,
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const data = [
      ...messages,
      {
        from: "cashier", // pengirim
        roomId: selectedRoom, // room tujuan
        text: input, // isi pesan
      },
    ];
    setMessages(data);
    onSend(data);
    setInput("");
  };

  return (
    <Drawer
      title="Message"
      placement="left"
      open={open}
      onClose={() => setOpen(false)}
      width={1024}
      closeIcon={<CloseOutlined style={{ fontSize: 20 }} />}
      bodyStyle={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Select room di atas */}
      <div style={{ padding: "0 16px 16px" }}>
        <Title level={5}>pilih room dahulu sebelum kirim pesan</Title>
        <Select
          placeholder="Pilih Room"
          style={{ width: "100%" }}
          value={selectedRoom}
          onChange={(val) => setSelectedRoom(val)}
          options={rooms.map((room) => ({
            label: room.name,
            value: room.id,
          }))}
        />
      </div>
      {/* Chat list scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          margin: "0 auto",
          padding: 16,
          width: "100%",
        }}
      >
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item
              style={{
                justifyContent: msg.from === "cashier" ? "end" : "start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.from === "cashier" ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                }}
              >
                {/* Nama pengirim */}
                {msg.from !== "cashier" && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "#555",
                    }}
                  >
                    {msg.from}
                  </div>
                )}

                {/* Bubble pesan */}
                <div
                  style={{
                    background: msg.from === "cashier" ? "#f5f5f5" : "#1890ff",
                    color: msg.from === "cashier" ? "#000" : "#fff",
                    padding: "10px 16px",
                    borderRadius: 20,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Input + keyboard fix di bawah */}
      <div style={{ marginTop: "auto" }}>
        <div style={{ display: "flex", marginTop: 12 }}>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..."
            onPressEnter={handleSend}
            autoFocus={true}
          />
          <Button type="primary" onClick={handleSend} style={{ marginLeft: 8 }}>
            <SendOutlined />
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
