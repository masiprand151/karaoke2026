import React from "react";
import { Button } from "antd";

export default function NumberPad({ onNumberClick, onClear, onDelete }) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button key={num} onClick={() => onNumberClick(num)}>
          {num}
        </Button>
      ))}
      <Button onClick={onClear}>C</Button>
      <Button onClick={() => onNumberClick(0)}>0</Button>
      <Button onClick={onDelete}>⌫</Button>
    </div>
  );
}
