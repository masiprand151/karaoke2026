import { useState } from "react";
import Modal from "./Modal";
import api from "../utils/api";

function DiscountForm({ transactionId, onClose }) {
  const [count, setCount] = useState(0);

  const handleChange = (e) => {
    const value = Number(e.target.value.replace(/\D/g, ""));

    setCount(value <= 0 ? 0 : value >= 100 ? 100 : value);
  };

  const handleDiscount = async () => {
    try {
      const confirmed = confirm(
        `Apa kamu yakin ingin discount room sebesar "${count}%".?`,
      );

      if (!confirmed) {
        setCount(0);
        onClose();
      }

      const res = await api.post("/session/discount", {
        transactionId: Number(transactionId),
        discount: Number(count),
      });

      alert("Berhasil melakukan discount");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Modal title={"Discount"} onClose={onClose}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="form-groub">
          <input
            type="text"
            className="form-input"
            value={count}
            onChange={handleChange}
          />
        </div>
        <p
          style={{
            fontWeight: "bold",
          }}
        >
          %
        </p>
      </div>
      <div className="action">
        <button onClick={handleDiscount}>Discount now</button>
      </div>
    </Modal>
  );
}

export default DiscountForm;
