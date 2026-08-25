import React from "react";

export default function SessionAction() {
  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex flex-column gap-2">
          <button className="btn btn-sm btn-outline-primary w-100">
            DISCOUNT ROOM
          </button>
          <button className="btn btn-sm btn-outline-secondary w-100">
            FREE MINUTE
          </button>
          <button className="btn btn-sm btn-outline-light w-100">
            STOP BILL
          </button>
          <button className="btn btn-sm btn-outline-danger w-100">
            CLOSE SESSION
          </button>
        </div>
      </div>
    </div>
  );
}
