import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import api from "../utils/api";

import "./home.css";

function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
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
  }, []);

  return (
    <div className="home-container">
      <h2 className="home-title">Daftar Room Karaoke</h2>
      <div className="room-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card active">
            <h3 className="room-name">{room.name}</h3>
            <p className="room-text">Name: MR.X</p>
            <p className="room-text">Timer: 00:00:00</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
