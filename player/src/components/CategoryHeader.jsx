import { Row, Button } from "antd";

function CategoryHeader() {
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
        "OTHERS",
      ].map((cat) => (
        <Button
          key={cat}
          type="dashed"
          style={{
            margin: "0 4px",
          }}
        >
          {cat}
        </Button>
      ))}
    </Row>
  );
}

export default CategoryHeader;
