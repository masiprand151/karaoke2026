import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./checkin.css";
import api from "../utils/api";

function Checkin() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [pricingType, setPricingType] = useState("REGULAR");

  const [form, setForm] = useState({
    customerName: "",
    pricingId: "",
    durationMinutes: 0,
  });

  const formattedToday = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const res = await api.get(`/room/${roomId}`);

      const roomData = res.room;

      setRoom(roomData);

      if (roomData.pricings.length > 0) {
        const pricing = roomData.pricings[0];

        setForm({
          customerName: "",
          pricingId: pricing.id,
          durationMinutes: pricing.durationMinutes ?? 60,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePricingChange = (e) => {
    const pricingId = Number(e.target.value);

    const pricing = room.pricings.find((p) => p.id === pricingId);

    setPricingType(pricing.name.toUpperCase());

    setForm((prev) => ({
      ...prev,
      pricingId,
      durationMinutes: pricing.durationMinutes ?? 60,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(window.localStorage.getItem("user"));
      const res = await api.post("/session/checkin", {
        roomId: Number(roomId),
        pricingId: form.pricingId,
        durationMinutes: form.durationMinutes,
        customerName: form.customerName,
        userId: user.id,
      });
      alert("Checkin succesfuly");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h3>Check In : {room?.name}</h3>

        <form className="checkin-form" onSubmit={handleSubmit}>
          <div>
            <label>Paket</label>

            <select value={form.pricingId} onChange={handlePricingChange}>
              {room?.pricings.map((pricing) => (
                <option key={pricing.id} value={pricing.id}>
                  {pricing.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tanggal</label>

            <input type="date" value={formattedToday} disabled />
          </div>

          <div>
            <label>Customer</label>

            <input
              type="text"
              value={form.customerName}
              required
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  customerName: e.target.value.toUpperCase(),
                }))
              }
            />
          </div>

          <div>
            <label>Duration (hour)</label>

            <input
              type="number"
              min={1}
              max={12}
              value={Number(form.durationMinutes) / 60}
              onChange={(e) => {
                const hour =
                  Number(e.target.value) < 1
                    ? 1
                    : Number(e.target.value) >= 12
                      ? 12
                      : Number(e.target.value);

                setForm((prev) => ({
                  ...prev,
                  durationMinutes: hour * 60,
                }));
              }}
              disabled={pricingType !== "REGULAR"}
            />
          </div>
          <button type="submit">Check In</button>

          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkin;
