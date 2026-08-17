const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "logs");
const logFile = path.join(logDir, "error.txt");

// Pastikan folder logs ada
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, {
    recursive: true,
  });
}

function logError(error, req = null) {
  const now = new Date();

  const timestamp = now.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  });

  const method = req?.method || "-";
  const url = req?.originalUrl || "-";
  const ip = req?.ip || "-";

  const message = `
========================================
TIME    : ${timestamp}
METHOD  : ${method}
URL     : ${url}
IP      : ${ip}
NAME    : ${error?.name || "Error"}
MESSAGE : ${error?.message || error}
STACK   :
${error?.stack || "-"}
========================================

`;

  // Tampilkan ke console
  // console.error(error);

  // Simpan ke file
  fs.appendFile(logFile, message, (err) => {
    if (err) {
      console.error("[LOGGER ERROR]", err);
    }
  });
}

module.exports = {
  logError,
};
