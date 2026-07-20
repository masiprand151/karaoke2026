import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import "./payment.css";
import { formatRp } from "../utils/rupiah";

function Payment() {
  const { sessionId } = useParams();
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const getPreview = async () => {
    try {
      const res = await api.get(`/session/preview/${sessionId}`);

      setData(res);
      console.log(res);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getPreview();
  }, []);

  useEffect(() => {
    setAmount(data?.grandTotal);
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDevault();
    try {
      const transactionId = data?.transaction.id;
      const res = await api.post(`/session/payment/${transactionId}`, {
        method,
        amount,
      });

      alert("Payment success");
      navigate(`/preview/${sessionId}`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="payment-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <h2 className="payment-title">Payment</h2>
        <div className="form-groub">
          <label>Metod</label>
          <select
            className="form-input"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
            <option value="ewallet">E-Wallet</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="text"
            className="form-input"
            value={formatRp(
              Number(amount) < data?.grandTotal ? data.grandTotal : amount,
            )}
            onChange={(e) => {
              setAmount(e.target.value.replace(/\D/g, ""));
            }}
          />
        </div>

        <div className="action">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(`/preview/${sessionId}`)}
          >
            back
          </button>
          <button
            className={data?.transaction?.status === "paid" ? "paid" : ""}
            type="submit"
            disabled={data?.transaction?.status === "paid"}
          >
            Pay now
          </button>
        </div>
      </form>
    </div>
  );
}

export default Payment;
