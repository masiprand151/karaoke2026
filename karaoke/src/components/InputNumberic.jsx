import { Input } from "antd";
import { useState } from "react";
import { formatRp } from "../utils/rupiah";

export default function InputNumberic({ id, value, onChange }) {
  const [number, setNumber] = useState(value || 0);

  const handleChange = (e) => {
    // ambil hanya digit
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const newNumber = digitsOnly ? parseInt(digitsOnly, 10) : 0;

    setNumber(newNumber);
    onChange?.(newNumber); // kirim angka murni ke parent
  };

  return (
    <span id={id}>
      <Input
        type="text"
        value={number} // tampilkan Rp + angka
        onChange={handleChange} // filter input
        style={{ width: "100%" }}
      />
    </span>
  );
}
