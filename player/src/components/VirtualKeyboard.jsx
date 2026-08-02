import { Button } from "antd";
import {
  DeleteOutlined,
  EnterOutlined,
  ArrowUpOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const keys = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

function VirtualKeyboard({ value = "", onChange, onEnter, inputRef }) {
  const [shift, setShift] = useState(false);

  // Ambil native input dari Ant Design Input
  const getInput = () => {
    return inputRef?.current?.input || inputRef?.current;
  };

  // =========================
  // INSERT CHARACTER
  // =========================
  const handleKey = (key) => {
    const input = getInput();

    if (!input) return;

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? start;

    const char = shift ? key.toUpperCase() : key.toLowerCase();

    const newValue = value.substring(0, start) + char + value.substring(end);

    onChange?.(newValue);

    const newPosition = start + char.length;

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(newPosition, newPosition);
    });
  };

  // =========================
  // BACKSPACE
  // =========================
  const handleBackspace = () => {
    const input = getInput();

    if (!input) return;

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? start;

    let newValue;
    let newPosition;

    // Kalau ada text yang diseleksi
    if (start !== end) {
      newValue = value.substring(0, start) + value.substring(end);

      newPosition = start;
    }

    // Kalau tidak ada selection
    else if (start > 0) {
      newValue = value.substring(0, start - 1) + value.substring(start);

      newPosition = start - 1;
    } else {
      return;
    }

    onChange?.(newValue);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(newPosition, newPosition);
    });
  };

  // =========================
  // SPACE
  // =========================
  const handleSpace = () => {
    const input = getInput();

    if (!input) return;

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? start;

    const newValue = value.substring(0, start) + " " + value.substring(end);

    onChange?.(newValue);

    const newPosition = start + 1;

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(newPosition, newPosition);
    });
  };

  // =========================
  // CLEAR
  // =========================
  const handleClear = () => {
    const input = getInput();

    onChange?.("");

    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(0, 0);
    });
  };

  return (
    <div
      style={{
        width: "100%",
        padding: 6,
        borderRadius: 8,
        boxSizing: "border-box",
      }}
    >
      {keys.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            width: "100%",
            gap: 4,
            marginBottom: 4,
          }}
        >
          {row.map((key) => (
            <Button
              key={key}
              style={{
                flex: 1,
                minWidth: 0,
                height: 39,
                padding: 0,
                fontSize: 14,
                fontWeight: "bold",
                // background: "transparent",
              }}
              onClick={() => handleKey(key)}
            >
              {shift ? key.toUpperCase() : key.toLowerCase()}
            </Button>
          ))}
        </div>
      ))}

      <div
        style={{
          display: "flex",
          width: "100%",
          gap: 4,
          marginTop: 4,
        }}
      >
        <Button
          icon={<ArrowUpOutlined />}
          style={{
            height: 36,
            flex: 1.2,

            // background: "transparent",
          }}
          onClick={() => setShift((prev) => !prev)}
        >
          Shift
        </Button>

        <Button
          style={{
            height: 36,
            flex: 4,
          }}
          onClick={handleSpace}
        >
          SPACE
        </Button>

        <Button
          style={{
            height: 36,
            flex: 1,
          }}
          onClick={handleClear}
        >
          Clear
        </Button>

        <Button
          icon={<ArrowLeftOutlined />}
          style={{
            height: 36,
            flex: 1,
          }}
          onClick={handleBackspace}
        />

        <Button
          icon={<EnterOutlined />}
          style={{
            height: 36,
            flex: 1.4,
          }}
          onClick={onEnter}
        >
          Enter
        </Button>
      </div>
    </div>
  );
}

export default VirtualKeyboard;
