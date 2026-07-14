import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

import "./home.css";
import { getRemainingTime } from "../utils/Time";

function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const WARNING_TIME = 15 * 60 * 1000; // 15 menit

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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => {
          const session = room?.sessions[0];

          const times = getRemainingTime(session?.start, session?.end);

          return {
            ...room,
            remaining: {
              ...times,
            },
          };
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      <h2 className="home-title">Daftar Room Karaoke</h2>
      <div className="room-grid">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`room-card ${room?.remaining?.remainingMs > 0 && room?.remaining?.remainingMs <= WARNING_TIME ? "warn" : room?.status === "used" && room?.remaining?.isExpired ? "close" : room.status}`}
            onClick={() => {
              if (room.status !== "used") {
                navigate(`/checkin/${room.id}`);
              }
            }}
          >
            <h3 className="room-name">{room.name}</h3>
            <p className="room-text">
              Name: {room.sessions?.[0]?.customerName ?? "-"}
            </p>
            <p className="room-text">
              Timer: {room.remaining?.remainingText ?? "--:--:--"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
