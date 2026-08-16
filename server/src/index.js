const express = require("express");
const cors = require("cors");
const AppError = require("./helpers/AppError");
const http = require("http");
// const { Server } = require("socket.io");
const { createIo } = require("./routes/socket.io");
const { logError } = require("./helpers/logger");

const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

createIo(server);

app.use("/songs", require("./routes/songs"));
app.use("/youtube", require("./routes/youtube"));

app.use("/auth", require("./routes/auth"));
app.use("/room", require("./routes/room"));

app.use("/session", require("./routes/sessions"));
app.use("/fnb", require("./routes/fnb"));
app.use("/lady", require("./routes/lady"));
app.use("/user", require("./routes/user"));
app.use("/pricing", require("./routes/pricing"));
app.use("/reports", require("./routes/report"));

// middleware error
app.use((err, req, res, next) => {
  logError(err, req);
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

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
