import { useEffect, useState } from "react";
import { filterNumber, formatRp } from "../../helpers/rupiah";

export default function CardPayment({ previews }) {
  const [method, setMetod] = useState("cash");
  const [change, setChange] = useState(0);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const payment = Number(amount) || 0;
    const total = Number(previews?.grandTotal) || 0;

    const result = payment - total;

    setChange(result > 0 ? result : 0);
  }, [amount, previews?.grandTotal]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title fw-bold fs-5">PAYMENT</span>
      </div>
      <div className="card-body">
        <div className="d-flex flex-column gap-3">
          <div className="d-flex dlex-row justify-content-between align-items-center fw-bold">
            <span>Total Bill</span>
            <span className="text-success">
              {formatRp(previews?.grandTotal)}
            </span>
          </div>
          <div className="d-flex dlex-row justify-content-between align-items-center">
            <span>Change</span>
            <span className="text-danger">{formatRp(change)}</span>
          </div>
          <div className="d-flex dlex-row justify-content-between align-items-center">
            <span>Status</span>
            <div>
              <span className="badge text-bg-success">
                {previews?.transaction?.status}
              </span>
            </div>
          </div>

          <hr />
          <div className="d-flex dlex-row justify-content-between align-items-center">
            <span>Method</span>
            <div>
              <select
                className="form-select form-select-sm"
                value={method}
                onChange={(e) => setMetod(e.target.value)}
              >
                <option value="cash">CASH</option>
                <option value="transfer">TRANSFER</option>
                <option value="qris">QRIS</option>
              </select>
            </div>
          </div>

          <div className="d-flex dlex-row justify-content-between align-items-center mb-3">
            <span>Amount</span>
            <div>
              <input
                type="text"
                className="form-control"
                value={formatRp(amount)}
                onChange={(e) => {
                  setAmount(filterNumber(e.target.value));
                }}
              />
            </div>
          </div>

          <button className="btn btn-primary w-100">PAYMENT PROCESS</button>
          <button className="btn btn-secondary w-100 mb-2">PRINT</button>
        </div>
      </div>
    </div>
  );
}
