import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import Modal from "../components/Modal";

import "./orderlady.css";

function OrderLady() {
  const { sessionId } = useParams();
  const [ladies, setLadies] = useState([]);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState({});
  const navigate = useNavigate();

  const fetchLady = async () => {
    try {
      const res = await api.get("/lady");
      console.log(res);
      setLadies(res.ladies);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchLady();
  }, []);

  const handleMin = () => {
    setSelected((prev) => {
      return {
        ...prev,
        quantity: prev.quantity <= 1 ? 1 : prev.quantity - 1,
      };
    });
  };

  const handlePlus = () => {
    setSelected((prev) => {
      return {
        ...prev,
        quantity: prev.quantity >= 10 ? 10 : prev.quantity + 1,
      };
    });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/lady/order", {
        sessionId,
        ladyId: selected.id,
        quantity: selected.quantity,
      });

      alert(`Berhasil order lady ${selected.name}`);
      setShow(false);
      setSelected({});
      fetchLady();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <div className="orderlady-layout">
        <div className="lady-list">
          <h2>Daftar Lady</h2>
          <div className="table-wrapper">
            <table className="sticky-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ladies.map((lady) => (
                  <tr key={lady.id}>
                    <td>{lady.name}</td>
                    <td>Rp {lady.basePrice}</td>
                    <td>
                      <button
                        className={lady.isJob ? "disabled" : ""}
                        onClick={() => {
                          setSelected({ ...lady, quantity: 1 });
                          setShow(true);
                        }}
                        disabled={lady.isJob}
                      >
                        Tambah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lady-footer">
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
      {show && (
        <Modal
          title={`${selected?.name} Duration (jam)`}
          onClose={() => {
            setSelected({});
            setShow(false);
          }}
        >
          <div className="modal-input">
            <button onClick={handleMin}>-</button>
            <div>
              <h4>{selected?.quantity}</h4>
            </div>
            <button onClick={handlePlus}>+</button>
          </div>
          <button className="confirm-btn" onClick={handleOrder}>
            Submit
          </button>
        </Modal>
      )}
    </>
  );
}

export default OrderLady;
