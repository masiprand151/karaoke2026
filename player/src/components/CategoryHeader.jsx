import { Row, Button, Drawer, Flex, Typography, Input } from "antd";
import { CloseOutlined, SettingOutlined } from "@ant-design/icons";
import { useState, useRef } from "react";
import NumberPad from "./NumberPad";
import { useNavigate } from "react-router-dom";
import useSetting from "../hooks/useSetting";

const { Title } = Typography;

function CategoryHeader({ setQuery, query, mode, setMode }) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [active, setActive] = useState("ALL");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { setting } = useSetting();
  const handleClick = (key) => {
    // jika tombol setting
    if (typeof key !== "string") {
      setOpen(true);
    } else if (key === "YOUTUBE") {
      setMode((prev) => !prev);
    } else {
      // jika key mau ambil category
      let keyCat = "";
      if (key === "INDO") {
        keyCat = "INDONESIA";
      } else {
        keyCat = key;
      }

      setQuery(keyCat === "ALL" ? "" : keyCat.toLowerCase());
    }
    setActive(key);
  };

  const handleNumberClick = (num) => setPin((prev) => prev + num);
  const handleClear = () => setPin("");
  const handleDelete = () => setPin((prev) => prev.slice(0, -1));

  const handleChange = (e) => {
    e.preventDefault();
    setPin(e.target.value);
  };

  const handleLogin = () => {};
  const handleClose = () => {
    if (pin === setting?.pin) {
      navigate("/");
    }
  };

  return (
    <Row justify="center" style={{ padding: "8px 0" }}>
      {[
        "ALL",
        "INDO",
        "DANGDUT",
        "DAERAH",
        "ANAK",
        "BARAT",
        "MANDARIN",
        "JEPANG",
        "KOREA",
        "HOUSE",
        "YOUTUBE",
        <SettingOutlined />,
      ].map((cat) => (
        <Button
          key={cat}
          type="dashed"
          danger={active === cat}
          style={{
            margin: "0 4px",
          }}
          onClick={() => handleClick(cat)}
        >
          {cat}
        </Button>
      ))}

      {/* Drawer login di sisi kiri */}
      <Drawer
        title=""
        placement="left"
        open={open}
        onClose={() => setOpen(false)}
        width={1024}
        closeIcon={<CloseOutlined style={{ color: "white", fontSize: 20 }} />}
      >
        <Flex vertical style={{ padding: "10% 30%" }}>
          <Title level={5}>Masukkan PIN</Title>
          <Input.Password
            ref={inputRef}
            value={pin}
            style={{ marginBottom: 16 }}
            placeholder="PIN"
            onChange={handleChange}
            autoFocus
          />

          <NumberPad value={pin} onChange={setPin} inputRef={inputRef} />
          {/* <Button
            type="primary"
            block
            style={{ marginTop: 16 }}
            onClick={handleLogin}
          >
            Finised
          </Button> */}
          <Button
            block
            style={{ marginTop: 16, background: "black", color: "#fff" }}
          >
            Restart
          </Button>
          <Button
            type="primary"
            block
            style={{ marginTop: 16 }}
            onClick={handleClose}
            danger
          >
            Exit
          </Button>
        </Flex>
      </Drawer>
    </Row>
  );
}

export default CategoryHeader;
