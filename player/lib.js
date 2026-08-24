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

const { app } = require("electron");

function getConfigPath() {
  // DEVELOPMENT
  if (!app.isPackaged) {
    return path.join(process.cwd(), "setting.json");
  }

  const base =
    process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);

  // PRODUCTION / sudah build
  return path.join(base, "setting.json");
}

function ensureConfig() {
  const configPath = getConfigPath();

  const directory = path.dirname(configPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }

  return configPath;
}

function getConfig() {
  const configPath = ensureConfig();

  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    console.error("CONFIG ERROR:", error);
    return path.join(process.cwd(), "setting.json");
  }
}

function saveConfig(config) {
  const configPath = ensureConfig();

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

  return config;
}

// ==========================
// BACKGROUND
// ==========================
function getBackground() {
  const config = getConfig();

  const filePath = config.background;

  if (!filePath) {
    return null;
  }

  if (!fs.existsSync(filePath)) {
    console.error("BACKGROUND TIDAK DITEMUKAN:", filePath);
    return null;
  }

  return {
    name: path.basename(filePath),
    path: filePath,
  };
}

module.exports = {
  getSongsFromFolder,
  getConfigPath,
  getConfig,
  saveConfig,
  getBackground,
};
