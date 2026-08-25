import { useState } from "react";
import BaseModal from "./BaseModal";
import useStorage from "../hooks/useStorage";
import useToast from "../hooks/useToast";
import api from "../services/api";

export default function ModalCheckin({
  show = false,
  onClose,
  room,
  onSuccess,
}) {
  const [priceType, setPriceType] = useState("regular");
  const [customerName, setCustomerName] = useState("");
  const [pricingId, setPricingId] = useState("");
  const [user, setUser, removeUser] = useStorage("user");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const filteredPricings = room?.pricings?.filter(
    (p) => p.name.toLowerCase() === priceType,
  );
  const handlePriceTypeChange = (type) => {
    setPriceType(type);

    // Reset pilihan harga ketika tipe berubah
    setPricingId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pricing = filteredPricings.find((p) => p.id === Number(pricingId));

      const data = {
        roomId: Number(room.id),
        pricingId: pricing.id,
        durationMinutes: pricing.durationMinutes,
        customerName: customerName,
        userId: user.id,
      };

      await api.post("/session/checkin", data);

      toast.success("Successfully opened a room");

      onSuccess?.();
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal show={show} onClose={onClose} title={`Checkin ${room?.name}`}>
      <form onSubmit={handleSubmit}>
        {/* PRICE TYPE */}
        <div className="d-flex gap-2 mb-3">
          <button
            type="button"
            className={`btn ${
              priceType === "regular" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handlePriceTypeChange("regular")}
          >
            REGULAR
          </button>

          <button
            type="button"
            className={`btn ${
              priceType === "package" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handlePriceTypeChange("package")}
          >
            PACKAGE
          </button>

          <button
            type="button"
            className={`btn ${
              priceType === "promo" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handlePriceTypeChange("promo")}
          >
            PROMO
          </button>
        </div>

        {/* CUSTOMER */}
        <div className="mb-3">
          <label className="form-label">Customer Name</label>

          <input
            type="text"
            className="form-control"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Masukkan nama customer"
          />
        </div>

        {/* PRICING */}
        <div className="mb-3">
          <label className="form-label">{priceType.toUpperCase()}</label>

          <select
            className="form-select"
            value={pricingId}
            onChange={(e) => setPricingId(e.target.value)}
          >
            <option value="">Pilih {priceType}</option>

            {filteredPricings?.map((pricing) => (
              <option key={pricing.id} value={pricing.id}>
                {pricing.durationMinutes / 60} Jam
                {" - "}
                Rp {Number(pricing.baseRate).toLocaleString("id-ID")}
              </option>
            ))}
          </select>
        </div>

        {/* OPEN */}
        <button type="submit" className="btn btn-primary mb-2 w-100">
          Open
        </button>

        {/* CANCEL */}
        <button
          type="button"
          className="btn btn-secondary w-100"
          onClick={onClose}
        >
          Cancel
        </button>
      </form>
    </BaseModal>
  );
}
