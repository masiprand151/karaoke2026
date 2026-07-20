import Modal from "./Modal";
import { useState, useEffect } from "react";
import api from "../utils/api";

function MoveRoom({ sessionId, onClose, onSuccess }) {
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
    <Modal title={"Move Room"} onClose={onClose}>
      <div className="form-groub">
        <label>Room List</label>
        <select
          className="form-input"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {rooms &&
            rooms.map((room) => (
              <option
                className={room.status === "used" ? "used" : ""}
                key={room.name}
                value={room.status === "used" ? room.status : room.id}
              >
                {room.name}
              </option>
            ))}
        </select>
      </div>
      <div className="action">
        <button onClick={handleMove}>Move</button>
      </div>
    </Modal>
  );
}

export default MoveRoom;
