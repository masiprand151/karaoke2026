const fs = require("fs");
const path = require("path");
const route = require("express").Router();
const prisma = require("../configs/prisma");
const os = require("os");
const { streamOriginal, transcodeVideo } = require("../helpers/streamParsing");

// ambil daftar drive
route.get("/drives", async (req, res, next) => {
  try {
    exec("wmic logicaldisk get name", (err, stdout) => {
      if (err) return next(err);

      const drives = stdout
        .split("\n")
        .filter((line) => /^[A-Z]:/.test(line))
        .map((line) => line.trim());

      const treeData = drives.map((drive) => ({
        title: drive,
        key: drive,
        isLeaf: false,
      }));

      res.json({ success: true, treeData });
    });
  } catch (error) {
    next(error);
  }
});
route.get("/folder", async (req, res, next) => {
  try {
    const folderPath = req.query.folderPath;
    if (!folderPath) {
      return res.json({
        success: false,
        children: [
          { title: "Path tidak diberikan", key: "error/no-path", isLeaf: true },
        ],
      });
    }

    let children = [];
    try {
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });

      children = entries
        .filter((entry) => entry.isDirectory()) // hanya folder
        .map((entry) => {
          const fullPath = path.join(folderPath, entry.name);
          return {
            title: entry.name,
            key: fullPath,
            isLeaf: false, // folder bukan leaf, bisa di-expand
          };
        });
    } catch {
      children = [
        {
          title: "Tidak bisa diakses",
          key: folderPath + "/error",
          isLeaf: true,
        },
      ];
    }

    res.json({ success: true, children });
  } catch (error) {
    next(error);
  }
});

// ambil isi file dalam folder (scan)
route.get("/scan", async (req, res, next) => {
  try {
    const folderPath = req.query.folderPath;
    if (!folderPath) {
      return res.json({ success: false, files: [] });
    }

    let files = [];
    try {
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });
      files = entries
        .filter((entry) => entry.isFile()) // hanya file
        .map((entry) => {
          const fullPath = path.join(folderPath, entry.name);
          const stats = fs.statSync(fullPath);
          return {
            name: entry.name,
            path: fullPath,
            size: stats.size,
            modified: stats.mtime,
          };
        });
    } catch {
      files = [];
    }

    res.json({ success: true, files });
  } catch (error) {
    next(error);
  }
});

function convertToUNC(localPath) {
  // ambil drive prefix, misalnya "D:\", "C:\", "E:\"
  const driveRegex = /^[A-Z]:\\/i;
  const baseUNC = `\\\\${os.hostname() || process.env.COMPUTERNAME}`;

  // replace drive prefix dengan UNC base
  return localPath.replace(driveRegex, baseUNC + "\\");
}

route.post("/import", async (req, res, next) => {
  try {
    const { songs } = req.body; //array
    const data = songs.map((f) => {
      const parts = f.name.split("#");
      return {
        name: parts[0], // judul sebelum #
        artist: parts[1] || "", // setelah # pertama
        region: parts[2] || "", // setelah # kedua
        filePath: f.path,
        size: f.size.toString(), // sesuai schema Songs pakai String
        isActive: true,
      };
    });

    // insert ke DB
    await prisma.songs.createMany({
      data,
      skipDuplicates: true, // biar tidak error kalau ada filePath sama
    });

    res.json({ success: true, count: data.length });
  } catch (error) {
    next(error);
  }
});

route.get("/", async (req, res, next) => {
  try {
    const search = req.query.search || "";

    const songs = await prisma.songs.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });

    res.json({
      success: true,
      songs,
    });
  } catch (error) {
    next(error);
  }
});

route.delete("/", async (req, res, next) => {
  try {
    const id = req.query.id || null;

    if (id) {
      await prisma.songs.delete({
        where: {
          id: Number(id),
        },
      });
    } else {
      await prisma.songs.deleteMany();
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

route.get("/stream", async (req, res) => {
  const file = req.query.file;

  if (!file || !fs.existsSync(file)) {
    return res.status(404).send("File not found");
  }

  const ext = path.extname(file).toLowerCase();

  // Format yang biasanya langsung didukung Chromium
  if (ext === ".mp4" || ext === ".webm") {
    return streamOriginal(file, req, res);
  }

  // Format lama seperti AVI/MPG/MPEG
  return transcodeVideo(file, req, res);
});

module.exports = route;
