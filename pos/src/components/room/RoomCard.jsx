import { BsDoorOpen, BsGear } from "react-icons/bs";

export default function RoomCard({ room, onDetail, onCheckin }) {
  const { name, status, customer, timer, checkIn, duration, reservation } =
    room;

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

  const config = statusConfig[status];

  return (
    <div className={`card room-card ${status}`}>
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
            <div className="fw-semibold room-customer">{customer}</div>

            <div className={`room-timer text-${config.color}`}>{timer}</div>

            <div className="room-info text-secondary">Check In: {checkIn}</div>

            <div className="room-info text-secondary">{duration}</div>

            <div className="room-actions">
              <button
                type="button"
                className="btn btn-outline-success btn-sm w-100"
                onClick={() => onDetail?.(room)}
              >
                Detail
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
                Checkin
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
