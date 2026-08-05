import { Drawer, Button, List, Input } from "antd";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";
import VirtualKeyboard from "./VirtualKeyboard";

export default function Message({
  setOpen,
  open,
  messages,
  setMessages,
  roomName,
  onSend,
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const data = [...messages, { from: roomName, text: input }];
    setMessages(data);
    onSend(data);
    setInput("");
  };

  return (
    <Drawer
      title="Message To Cashier"
      placement="left"
      open={open}
      onClose={() => setOpen(false)}
      width={1024}
      closeIcon={<CloseOutlined style={{ color: "white", fontSize: 20 }} />}
      bodyStyle={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
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
                justifyContent: msg.from !== "cashier" ? "end" : "start",
              }}
            >
              <div
                style={{
                  background: msg.from !== "cashier" ? "#f5f5f5" : "#1890ff",
                  color: msg.from !== "cashier" ? "#000" : "#fff",
                  padding: "10px 16px",
                  borderRadius: 20,
                  maxWidth: "70%",
                }}
              >
                {msg.text}
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
        <VirtualKeyboard
          value={input}
          onChange={setInput}
          inputRef={inputRef}
        />
      </div>
    </Drawer>
  );
}
