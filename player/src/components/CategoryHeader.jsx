import { Row, Button } from "antd";

function CategoryHeader() {
  return (
    <Row justify="center" style={{ padding: "8px 0", background: "#111" }}>
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
        "OTHERS",
      ].map((cat) => (
        <Button
          key={cat}
          style={{
            margin: "0 4px",
            background: "#400",
            color: "#fff",
            border: "1px solid #f00",
          }}
        >
          {cat}
        </Button>
      ))}
    </Row>
  );
}

export default CategoryHeader;
