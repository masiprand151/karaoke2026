const express = require("express");
const cors = require("cors");
const AppError = require("./helpers/AppError");

const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config();

const port = process.env.PORT || 3000;

// Simple test route
app.get("/", (req, res) => {
  res.json({ message: "Karaoke API is running..." });
});

app.use("/auth", require("./routes/auth"));
app.use("/room", require("./routes/room"));
app.use("/session", require("./routes/sessions"));
app.use("/fnb", require("./routes/fnb"));
app.use("/lady", require("./routes/lady"));

// middleware error
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(port, () => {
  console.log("Server running on http://localhost:" + port);
});
