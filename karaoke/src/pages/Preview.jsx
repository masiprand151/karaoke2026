import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useEffect, useState } from "react";

import "./preview.css";

export default function Preview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});

  const getPreview = async () => {
    try {
      const res = await api.get(`/session/preview/${sessionId}`);
      console.log(res);
      setData(res);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getPreview();
  }, []);

  return (
    <div className="preview-container">
      <div className="preview-card">
        <h2>Preview Billing</h2>

        <table className="preview-table">
          <tbody>
            <tr>
              <td>Custoner</td>
              <td>{data?.customerName}</td>
              <td></td>
            </tr>
            <tr>
              <td>Room</td>
              <td>{data?.room?.name}</td>
              <td>
                <button>Move</button>
              </td>
            </tr>
            <tr>
              <td>Duration</td>
              <td>{data?.durationMinutes / 60} Jam</td>
              <td>
                <button>Edit</button>
              </td>
            </tr>
            <tr>
              <td>Extend</td>
              <td>{data?.extendMinutes / 60} Jam</td>
              <td>
                <button>Add</button>
              </td>
            </tr>
            <tr>
              <td>Free Minute</td>
              <td>{data?.freeMinutes} Jam</td>
              <td>
                <button>Add</button>
              </td>
            </tr>
            <tr>
              <td>Status</td>
              <td>{data?.status} Jam</td>
              <td></td>
            </tr>
            <tr>
              <td>Base Amount</td>
              <td>Rp {data?.amount}</td>
              <td></td>
            </tr>
            <tr>
              <td>Tax</td>
              <td>Rp {data?.taxAmount}</td>
              <td></td>
            </tr>
            <tr>
              <td>Service</td>
              <td>Rp {data?.serviceAmount}</td>
              <td></td>
            </tr>
            <tr>
              <td>F&B</td>
              <td>Rp {data?.fnbTotal}</td>
              <td></td>
            </tr>
            <tr>
              <td>Lady</td>
              <td>Rp {data?.ladyTotal}</td>
              <td></td>
            </tr>
            <tr className="grand-total">
              <td>Grand Total</td>
              <td>Rp {data?.grandTotal}</td>
              <td>
                <button>Payment</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="action">
          <button onClick={() => navigate(-1)}>back</button>
        </div>
      </div>
    </div>
  );
}
