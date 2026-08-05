import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getRemainingTime } from "../utils/Time";

export default function useRoomSession({
  maintenance = false,
  checkin = null,
  maintenanceMinutes = 10,
}) {
  const navigate = useNavigate();

  const [remaining, setRemaining] = useState(null);
  const [mode, setMode] = useState("standby");
  const [room, setRoom] = useState(null);

  const getRoom = async () => {
    try {
      const setting = await window.electron.getSetting();
      const res = await api.get(`/room/${setting?.roomId}`);
      const { sessions = [], ...room } = res;

      // Cari session yang masih aktif
      const activeSession = sessions.find(
        (session) => session.closed === false,
      );

      const data = {
        ...room,

        ...(activeSession && {
          sessionId: activeSession.id,
          userId: activeSession.userId,
          customerName: activeSession.customerName,
          start: activeSession.start,
          end: activeSession.end,
          closed: activeSession.closed,
          durationMinutes: activeSession.durationMinutes,
          extendMinutes: activeSession.extendMinutes,
          freeMinutes: activeSession.freeMinutes,
          createdAt: activeSession.createdAt,
        }),
      };

      setRoom(data.room);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRoom();
  }, []);

  useEffect(() => {
    if (!room || mode !== "checkin") return;
    const interval = setInterval(() => {
      const session = room.sessions[0];
      if (!session) {
        navigate("/");
        return;
      }
      const time = getRemainingTime(session.start, session.end);

      setRemaining(time);
    }, 1000);

    return () => clearInterval(interval);
  }, [room, mode]);

  // ==========================================
  // TENTUKAN MODE
  // ==========================================
  useEffect(() => {
    if (maintenance && !checkin) {
      setMode("maintenance");
      return;
    }

    if (checkin) {
      setMode("checkin");
      return;
    }

    setMode("standby");
  }, [maintenance, checkin]);

  // ==========================================
  // MAINTENANCE TIMER
  // ==========================================
  useEffect(() => {
    if (mode !== "maintenance") {
      return;
    }

    const minutes = Number(maintenanceMinutes) || 10;

    // Pakai waktu akhir agar timer tetap akurat
    const endTime = Date.now() + minutes * 60 * 1000;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      setRemaining(getRemainingTime(Date.now(), endTime));
      if (remaining <= 0) {
        navigate("/");
      }
    };

    // langsung tampilkan waktu awal
    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [mode, maintenanceMinutes, navigate]);

  return {
    mode,

    // status
    isMaintenance: mode === "maintenance",
    isCheckin: mode === "checkin",
    isStandby: mode === "standby",
    remaining,
  };
}
