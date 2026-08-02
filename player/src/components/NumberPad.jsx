import { Button } from "antd";

export default function NumberPad({ value = "", onChange, inputRef, onEnter }) {
  // Ambil native input dari Ant Design Input
  const getInput = () => {
    return inputRef?.current?.input || inputRef?.current;
  };

  // =========================
  // INSERT NUMBER
  // =========================
  const handleNumber = (number) => {
    const input = getInput();

    if (!input) return;

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? start;

    const char = String(number);

    const newValue = value.substring(0, start) + char + value.substring(end);

    onChange?.(newValue);

    const newPosition = start + 1;

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(newPosition, newPosition);
    });
  };

  // =========================
  // DELETE / BACKSPACE
  // =========================
  const handleDelete = () => {
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

    // Hapus karakter sebelum caret
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
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button key={num} onClick={() => handleNumber(num)}>
          {num}
        </Button>
      ))}

      <Button danger onClick={handleClear}>
        C
      </Button>

      <Button onClick={() => handleNumber(0)}>0</Button>

      <Button onClick={handleDelete}>⌫</Button>
    </div>
  );
}
