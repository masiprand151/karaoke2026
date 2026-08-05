const express = require("express");
const cors = require("cors");
const AppError = require("./helpers/AppError");
const { protectedAuth } = require("./middleware/auth.middleware");
const http = require("http");
// const { Server } = require("socket.io");
const { createIo } = require("./routes/socket.io");

const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

createIo(server);

app.use("/songs", require("./routes/songs"));

app.use("/auth", require("./routes/auth"));
app.use("/room", require("./routes/room"));

app.use(protectedAuth);
app.use("/session", require("./routes/sessions"));
app.use("/fnb", require("./routes/fnb"));
app.use("/lady", require("./routes/lady"));
app.use("/user", require("./routes/user"));
app.use("/pricing", require("./routes/pricing"));

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

server.listen(port, () => {
  console.log("Server running on http://localhost:" + port);
});
