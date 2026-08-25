import { useState } from "react";
import { formatRp } from "../../helpers/rupiah";

export default function CardSummary({ previews }) {
  const [tab, setTab] = useState("details");

  const sub =
    Number(previews?.amount) +
    Number(previews?.fnbSubtotal) +
    Number(previews?.ladyTotal) -
    Number(previews?.roomDisAmount);

  return (
    <div className="card">
      <div className="card-header fw-normal">
        <ul className="nav nav-underline d-flex justify-content-between">
          <li className="nav-item">
            <span
              style={{
                cursor: "pointer",
                color: "#fff",
              }}
              onClick={() => setTab("details")}
              className={`nav-link ${tab === "details" ? "active text-primary" : ""}`}
            >
              DETAILS
            </span>
          </li>
          <li className="nav-item">
            <span
              style={{
                cursor: "pointer",
                color: "#fff",
              }}
              onClick={() => setTab("fnb")}
              className={`nav-link ${tab === "fnb" ? "active text-primary" : ""}`}
            >
              F&B (
              {previews?.sessionFnbs?.length === 0
                ? 0
                : previews?.sessionFnbs?.length + 1}
              )
            </span>
          </li>
          <li className="nav-item">
            <span
              style={{
                cursor: "pointer",
                color: "#fff",
              }}
              onClick={() => setTab("ladies")}
              className={`nav-link ${tab === "ladies" ? "active text-primary" : ""}`}
            >
              LADIES (
              {previews?.sessionLadies?.length === 0
                ? 0
                : previews?.sessionLadies?.length + 1}
              )
            </span>
          </li>
        </ul>
      </div>
      <div className="card-body">
        {tab === "details" && (
          <div className="d-flex flex-column gap-3">
            <div className="d-flex dlex-row  justify-content-between">
              <span>Room Cost</span>
              <div>
                <span>{formatRp(previews?.amount)}</span>
              </div>
            </div>
            <div className="d-flex dlex-row  justify-content-between">
              <span>F&B Order</span>
              <div>
                <span>{formatRp(previews?.fnbSubtotal)}</span>
              </div>
            </div>
            <div className="d-flex dlex-row  justify-content-between">
              <span>Lady Companion</span>
              <div>
                <span>{formatRp(previews?.ladyTotal)}</span>
              </div>
            </div>
            <div className="d-flex dlex-row  justify-content-between">
              <span>Room Discount ({previews?.roomDis}%)</span>
              <div>
                <span>{formatRp(previews?.roomDisAmount)}</span>
              </div>
            </div>
            <hr />
            <div className="d-flex dlex-row  justify-content-between fw-bold">
              <span>Subtotal</span>
              <div>
                <span>{formatRp(sub)}</span>
              </div>
            </div>

            <div className="d-flex dlex-row  justify-content-between">
              <span>Service ({previews?.pricing?.serviceCharge}%)</span>
              <div>
                <span>{formatRp(previews?.serviceAmount)}</span>
              </div>
            </div>
            <div className="d-flex dlex-row  justify-content-between">
              <span>Tax ({previews?.pricing?.taxRate}%)</span>
              <div>
                <span>{formatRp(previews?.taxAmount)}</span>
              </div>
            </div>
            <hr />
            <div className="d-flex dlex-row  justify-content-between fw-bold">
              <span>GRAND TOTAL</span>
              <div>
                <span>{formatRp(previews?.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === "fnb" && tab}
        {tab === "ladies" && tab}
      </div>
    </div>
  );
}
