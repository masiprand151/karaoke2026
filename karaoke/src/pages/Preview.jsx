import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useEffect, useState } from "react";
import MoveRoom from "../components/MoveRoom";

import "./preview.css";
import { formatRp } from "../utils/rupiah";
import DiscountForm from "../components/DiscountForm";
import LadyCountdown from "../components/LadyCountdown";
import Modal from "../components/Modal";

export default function Preview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [showMvRoom, setShowMvRoom] = useState(false);
  const [showDisRoom, setShowDisRoom] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [duration, setDuration] = useState(0);

  const getPreview = async () => {
    try {
      const res = await api.get(`/session/preview/${sessionId}`);

      setData(res);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getPreview();
  }, []);

  const handleCheckout = async () => {
    if (data?.transaction?.status !== "paid") {
      alert("Lakukan pembayaran terlebih dahulu!");
      return;
    }
    try {
      await api.post(`/session/checkout/${data?.id}`);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
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
                  <button onClick={() => setShowMvRoom(true)}>Move</button>
                </td>
              </tr>
              <tr>
                <td>Duration</td>
                <td>{data?.durationMinutes / 60} Jam</td>
                <td>
                  <button
                    onClick={() => {
                      if (data.status !== "paid") {
                      } else {
                        alert("Sesi sudah lunas");
                      }
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
              <tr>
                <td>Extend</td>
                <td>{data?.extendMinutes / 60} Jam</td>
                <td>
                  <button
                    onClick={() => {
                      if (data.status !== "paid") {
                        setShowModal(true);
                        setModalType("Extend");
                      } else {
                        alert("Sesi sudah lunas");
                      }
                    }}
                  >
                    Add
                  </button>
                </td>
              </tr>
              <tr>
                <td>Free Minute</td>
                <td>{data?.freeMinutes} Jam</td>
                <td>
                  <button
                    onClick={() => {
                      if (data.status !== "paid") {
                        setShowModal(true);
                        setModalType("Free Minute");
                      } else {
                        alert("Sesi sudah lunas");
                      }
                    }}
                  >
                    Add
                  </button>
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
                <td>Room Discount</td>
                <td>{formatRp(data?.roomDisAmount)}</td>
                <td>
                  <button onClick={() => setShowDisRoom(true)}>Edit</button>
                </td>
              </tr>
              <tr>
                <td>F&B</td>
                <td>{formatRp(data?.fnbSubtotal)}</td>
                <td>
                  <button
                    onClick={() => {
                      if (data.status !== "paid") {
                        navigate(`/fnb/order/${sessionId}`);
                      } else {
                        alert("Sesi sudah lunas");
                      }
                    }}
                  >
                    Order
                  </button>
                </td>
              </tr>
              <tr>
                <td>Lady</td>
                <td>{formatRp(data?.ladyTotal)}</td>
                <td>
                  <button
                    onClick={() => {
                      if (data.status !== "paid") {
                        navigate(`/lady/order/${sessionId}`);
                      } else {
                        alert("Sesi sudah lunas");
                      }
                    }}
                  >
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
                  <button
                    onClick={() => {
                      if (data.status !== "paid") {
                        navigate(`/payment/${sessionId}`);
                      } else {
                        alert("Sesi sudah lunas");
                      }
                    }}
                  >
                    Payment
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="action">
            <button onClick={() => navigate("/")}>back</button>
            <button onClick={handleCheckout}>checkout</button>
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
                    <th>Time</th>
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
                        <LadyCountdown
                          ladyId={sl.lady?.id}
                          start={sl.start}
                          end={sl.end}
                          isJob={sl.lady?.isJob}
                        />
                      </td>
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

      {/* mv room */}
      {showMvRoom && (
        <MoveRoom
          sessionId={sessionId}
          newRoomId={2}
          onClose={() => setShowMvRoom(false)}
          onSuccess={() => navigate("/")}
        />
      )}

      {showDisRoom && (
        <DiscountForm
          transactionId={data?.transaction?.id}
          onClose={() => {
            setShowDisRoom(false);
            getPreview();
          }}
        />
      )}

      {showModal && (
        <Modal
          title={modalType}
          onClose={() => {
            setModalType(null);
            setShowModal(false);
          }}
        >
          <div
            className="form-groub"
            style={{
              width: "95%",
            }}
          >
            <input
              type="number"
              value={duration}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 9) {
                  setDuration(9);
                } else if (v <= 0) {
                  setDuration(0);
                } else {
                  setDuration(e.target.value);
                }
              }}
              className="form-input"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
