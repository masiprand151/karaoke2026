const fs = require("fs");
const path = require("path");

function getSongsFromFolder(folderPath) {
  try {
    const filePath = path.join(folderPath);

    // cek apakah file ada
    if (fs.existsSync(filePath)) {
      return {
        id: Date.now() + Math.random(), // id unik
        name: path.basename(filePath),
        path: filePath,
      };
    } else {
      console.error("File tidak ditemukan:", filePath);
      return null;
    }
  } catch (err) {
    console.error("Gagal ambil file:", err);
    return null;
  }
}

module.exports = { getSongsFromFolder };
