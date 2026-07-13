import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./checkin.css";
import api from "../utils/api";
function Checkin() {
  const { roomId } = useParams();
  const [customer, setCustomer] = useState("");
  const [duration, setDuration] = useState(2);
  const navigate = useNavigate();
  const [room, setRoom] = useState({});

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const dd = String(today.getDate()).padStart(2, "0");

  const formattedToday = `${yyyy}-${mm}-${dd}`;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/room/${roomId}`);
        setRoom(res.room);
      } catch (error) {
        console.log(error.message);
      }
    })();
  }, [roomId]);

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h3>Checkin : {room?.name}</h3>
        <form className="checkin-form">
          <div>
            <label>Type</label>
            <select>
              <option value="regular">REGULAR</option>
            </select>
          </div>
          <div>
            <label>Date</label>
            <input type="date" value={formattedToday} disabled />
          </div>

          <div>
            <label>Customer</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label>Duration</label>
            <input
              type="number"
              min={1}
              max={10}
              value={duration}
              onChange={(e) =>
                setDuration(
                  e.target.value > 10
                    ? 10
                    : e.target.value < 1
                      ? 1
                      : e.target.value,
                )
              }
            />
          </div>

          <button>Submit</button>
          <button onClick={() => navigate("/")}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default Checkin;
