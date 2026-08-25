import { useEffect, useState } from "react";
import { BsDoorOpen, BsGear } from "react-icons/bs";
import { formatDuration, getRemainingTime } from "../../helpers/Time";

export default function RoomCard({ room, onDetail, onCheckin }) {
  const { name, status, sessions = [] } = room;
  const [timer, setTimer] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [isWarn, setIsWarn] = useState(false);

  const isOccupied = status === "used";

  const statusConfig = {
    used: {
      color: "success",
      label: "USED",
    },

    warning: {
      color: "warning",
      label: "WARNING",
    },

    standby: {
      color: "primary",
      label: "STANDBY",
    },
    maintenent: {
      color: "secondary",
      label: "MAINTENENT",
    },
  };

  // remaining atau timer saat checkin
  useEffect(() => {
    if (!isOccupied) return;
    const session = sessions?.[0];
    setCustomerName(session?.customerName);
    const interval = setInterval(() => {
      if (session?.closed) {
        clearInterval(interval);
        return;
      }

      const times = getRemainingTime(session?.start, session?.end);

      setTimer(times?.remainingText);
      setIsWarn(times?.warning);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [room]);

  const config = statusConfig[status];

  return (
    <div className={`card room-card ${isWarn ? "warning" : status}`}>
      <div className="card-body p-1">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold room-name">{name}</span>

          <span className={`badge text-bg-${config.color} room-status`}>
            {config.label}
          </span>
        </div>

        {/* OCCUPIED */}
        {isOccupied && (
          <>
            <div className="fw-semibold room-customer">
              Customer: {customerName}
            </div>
            <div className={`room-timer text-${config.color}`}>
              Remaining: {timer || "00:00:00"}
            </div>

            <div className="room-actions">
              <button
                type="button"
                className="btn btn-outline-success btn-sm w-100"
                onClick={() => onDetail?.(room)}
              >
                DETAIL
              </button>
            </div>
          </>
        )}

        {/* EMPTY */}
        {status === "standby" && (
          <>
            <div className="room-empty">
              <BsDoorOpen size={20} />
            </div>

            <div className="room-info text-secondary">{config.label}</div>

            <div className="room-actions">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm w-100"
                onClick={() => onCheckin?.(room)}
              >
                OPEN
              </button>
            </div>
          </>
        )}

        {/* EMPTY */}
        {status === "maintenent" && (
          <>
            <div className="room-empty">
              <BsGear size={20} />
            </div>

            <div className="room-info text-secondary">{config.label}</div>

            <div className="room-actions">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100"
                disabled
              >
                Maintenent
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
