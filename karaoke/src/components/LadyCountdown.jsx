import { useState, useEffect } from "react";
import api from "../utils/api";

function LadyCountdown({ start, end, ladyId, isJob }) {
  const [timeLeft, setTimeLeft] = useState("");

  const updateLadyOff = async () => {
    try {
      const res = await api.patch(`/lady/${ladyId}/off`);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const endTime = new Date(end).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0 || !isJob) {
        clearInterval(interval);
        // auto update status
        if (isJob) {
          updateLadyOff();
        }
        setTimeLeft("Selesai");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0",
          )}:${String(seconds).padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [end]);

  return timeLeft;
}

export default LadyCountdown;
