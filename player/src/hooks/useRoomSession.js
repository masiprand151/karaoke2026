import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useRoomSession({
  maintenance = false,
  checkin = null,
  maintenanceMinutes = 10,
}) {
  const navigate = useNavigate();

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [mode, setMode] = useState("standby");

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
      setRemainingSeconds(0);
      return;
    }

    const minutes = Number(maintenanceMinutes) || 10;

    // Pakai waktu akhir agar timer tetap akurat
    const endTime = Date.now() + minutes * 60 * 1000;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      setRemainingSeconds(remaining);

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

  // ==========================================
  // FORMAT WAKTU
  // ==========================================
  const formatTime = (seconds = remainingSeconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  };

  return {
    mode,

    // status
    isMaintenance: mode === "maintenance",
    isCheckin: mode === "checkin",
    isStandby: mode === "standby",

    // timer
    remainingSeconds,
    remainingText: formatTime(),

    // helper
    formatTime,
  };
}
