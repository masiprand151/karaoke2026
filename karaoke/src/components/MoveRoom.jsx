import { useState, useEffect } from "react";
import api from "../utils/api";
import { Modal, Form, Select, Button, Tag } from "antd";

function MoveRoom({ open, sessionId, onClose, onSuccess }) {
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/room");

      setRooms(res.rooms);
    } catch (error) {
      setError(error.message);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, [sessionId]);

  const handleMove = async (e) => {
    try {
      if (selected === "used") {
        alert("Pilih room dahulu!");
      }

      const res = await api.post("/room/move", {
        sessionId: Number(sessionId),
        newRoomId: Number(selected),
      });

      alert("Yey.!, berhasil pindah room");
      onSuccess?.();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Modal
      open={open}
      title="Move Room"
      centered
      destroyOnHidden
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="move" type="primary" onClick={handleMove}>
          Move Room
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Room List">
          <Select
            value={selected}
            onChange={setSelected}
            placeholder="Pilih Room"
          >
            {rooms?.map((room) => (
              <Select.Option
                key={room.id}
                value={room.status === "used" ? room.status : room.id}
                disabled={room.status === "used"}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{room.name}</span>

                  <Tag color={room.status === "used" ? "red" : "green"}>
                    {room.status === "used" ? "USED" : "AVAILABLE"}
                  </Tag>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default MoveRoom;
