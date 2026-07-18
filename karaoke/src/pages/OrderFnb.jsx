import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

import "./orderfnb.css";
import { formatRp } from "../utils/rupiah";

function OrderFnb() {
  const { sessionId } = useParams();
  const [fnbs, setFnbs] = useState([]);
  const [selectedFnb, setSelectedFnb] = useState("");
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState(null);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/fnb");
        setFnbs(res.fnbs);
      } catch (error) {
        console.log(error.message);
      }
    })();
  }, []);
  const addToCart = (fnb) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === fnb.id);
      if (existing) {
        return prev.map((item) =>
          item.id === fnb.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...fnb, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmOrder = async (e) => {
    e.preventDefault();

    try {
      const res = await Promise.all(
        cart.map(async (item) => {
          return api.post("/fnb/order", {
            sessionId: Number(sessionId),
            fnbId: item.id,
            quantity: item.quantity,
          });
          return true;
        }),
      );
      alert("Yey! berhasil order");
      navigate(-1);
      setCart([]);
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  return (
    <div className="orderfnb-layout">
      <div className="fnb-list">
        <div className="title">
          <h2>Product List</h2>
          <div>
            <input type="search" placeholder="search" />
            <button className="btn-search">search</button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="sticky-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Harga</th>
                <th>Stock</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fnbs.map((fnb) => (
                <tr key={fnb.id}>
                  <td>{fnb.name}</td>
                  <td>{formatRp(fnb.basePrice)}</td>
                  <td>{fnb.stock}</td>
                  <td>
                    <button className="btn-add" onClick={() => addToCart(fnb)}>
                      Tambah
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cart">
        <h2>Cart</h2>
        <div className="table-wrapper">
          <table className="sticky-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>Rp {item.basePrice * item.quantity}</td>
                  <td>
                    <button
                      className="btn-del"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="confirm-btn"
          onClick={confirmOrder}
          disabled={cart.length <= 0}
        >
          Confirm Order
        </button>
        <button className="back-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
export default OrderFnb;
