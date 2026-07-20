import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useEffect, useState } from "react";

import "./preview.css";
import { formatRp } from "../utils/rupiah";

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
              <td>{data?.status}</td>
              <td></td>
            </tr>
            <tr>
              <td>Room Amount</td>
              <td>{formatRp(data?.amount)}</td>
              <td></td>
            </tr>
            <tr>
              <td>Room Dis</td>
              <td>{formatRp(0)}</td>
              <td>
                <button>Edit</button>
              </td>
            </tr>
            <tr>
              <td>F&B</td>
              <td>{formatRp(data?.fnbSubtotal)}</td>
              <td>
                <button onClick={() => navigate(`/fnb/order/${sessionId}`)}>
                  Order
                </button>
              </td>
            </tr>
            <tr>
              <td>Lady</td>
              <td>{formatRp(data?.ladyTotal)}</td>
              <td>
                <button onClick={() => navigate(`/lady/order/${sessionId}`)}>
                  Order
                </button>
              </td>
            </tr>
            <tr>
              <td>Tax</td>
              <td>{formatRp(data?.taxAmount)}</td>
              <td></td>
            </tr>
            <tr>
              <td>Service</td>
              <td>{formatRp(data?.serviceAmount)}</td>
              <td></td>
            </tr>
            <tr className="grand-total">
              <td>Grand Total</td>
              <td>{formatRp(data?.grandTotal)}</td>
              <td>
                <button onClick={() => navigate(`/payment/${sessionId}`)}>
                  Payment
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="action">
          <button onClick={() => navigate(-1)}>back</button>
          <button>checkout</button>
        </div>
      </div>
      <div className="preview-card list-order">
        <div className="half-table">
          <h2>Preview F&B</h2>
          <div className="table-wrapper">
            <table className="sticky-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Qty</th>
                  <th>Harga</th>
                  <th>Total</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data?.sessionFnbs?.map((sf) => (
                  <tr key={sf.id}>
                    <td>{sf.fnb?.name}</td>
                    <td>{sf.quantity}</td>
                    <td>{formatRp(sf.unitPrice)}</td>
                    <td>{formatRp(sf.totalAmount)}</td>
                    <td>
                      <button>edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="half-table">
          <h2>Preview Lady</h2>
          <div className="table-wrapper">
            <table className="sticky-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Qty</th>
                  <th>Harga</th>
                  <th>Total</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data?.sessionLadies?.map((sl) => (
                  <tr key={sl.id}>
                    <td>{sl.lady?.name}</td>
                    <td>{sl.quantity}</td>
                    <td>{formatRp(sl.unitPrice)}</td>
                    <td>{formatRp(sl.totalAmount)}</td>
                    <td>
                      <button>edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
