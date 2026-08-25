import { getRemainingTime } from "../../helpers/Time";

export default function CardDeatail({ previews }) {
  const checkin = new Date(previews?.start).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const start = new Date(previews?.start);
  const end = new Date(previews?.end);

  const diffMs = end - start;

  const totalHours = diffMs / (1000 * 60 * 60);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title fw-bold fs-5">TRANSACTION</div>
      </div>
      <div className="card-body">
        <div className="d-flex flex-column gap-3">
          <div className="d-flex dlex-row  justify-content-between">
            <span>Room</span>
            <div>
              <span className="badge text-bg-success">
                {previews?.room?.name.toUpperCase() || "-"}
              </span>
            </div>
          </div>
          <div className="d-flex dlex-row  justify-content-between">
            <span>Customer</span>
            <span>{previews?.customerName}</span>
          </div>
          <div className="d-flex dlex-row  justify-content-between">
            <span>Checkin</span>
            <span>{checkin?.replace(".", ":")}</span>
          </div>
          <div className="d-flex dlex-row  justify-content-between">
            <span>Duration</span>
            <span>
              {!isNaN(totalHours) && totalHours} JAM
              {` - ${previews?.pricing?.name.toUpperCase()}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
