import { Input } from "antd";
import { useState, useRef } from "react";
import { formatRp } from "../utils/rupiah";
import { useEffect } from "react";

export default function InputNumberic({
  id,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  style,
}) {
  const inputRef = useRef();
  const [number, setNumber] = useState(value || 0);

  const handleChange = (e) => {
    // ambil hanya digit
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const newNumber = digitsOnly ? parseInt(digitsOnly, 10) : 0;

    setNumber(newNumber);
  };

  const handleDown = (e) => {
    if (e.code !== "ArrowDown") return;

    setNumber((prev) => (prev <= 0 ? 0 : prev - 1));
  };

  const handleUp = (e) => {
    if (e.code !== "ArrowUp") return;

    setNumber((prev) => prev + 1);
  };

  useEffect(() => {
    onChange?.(number);
  }, [number]);

  return (
    <span id={id}>
      <Input
        ref={inputRef}
        type="text"
        value={number} // tampilkan Rp + angka
        onChange={handleChange} // filter input
        style={{ width: "100%" }}
        placeholder={placeholder || ""}
        style={style}
        min={min}
        max={max}
        onKeyDown={handleDown}
        onKeyUp={handleUp}
      />
    </span>
  );
}
