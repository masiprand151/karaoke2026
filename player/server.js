const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const mime = require("mime-types");
const cors = require("cors");
const { getConfig } = require("./lib");
const { app } = require("electron");
const { streamYoutube } = require("./yt");

let server = null;

const wallpaper = app.isPackaged
  ? path.join(process.env.PORTABLE_EXECUTABLE_DIR, "Animasi.mp4")
  : path.join(process.cwd(), "Animasi.mp4");

const ffmpegPath = app.isPackaged
  ? path.join(process.env.PORTABLE_EXECUTABLE_DIR, "ffmpeg.exe")
  : path.join(process.cwd(), "ffmpeg.exe");

const ffprobePath = app.isPackaged
  ? path.join(process.env.PORTABLE_EXECUTABLE_DIR, "ffprobe.exe")
  : path.join(process.cwd(), "ffprobe.exe");

function startLocalVideoServer() {
  if (server) return;

  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "HEAD", "OPTIONS"],
      allowedHeaders: ["Range", "Content-Type"],
      exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length"],
    }),
  );
  app.use(express.json());

  app.get("/wallpaper", (req, res) => {
    if (!fs.existsSync(wallpaper)) {
      return res.sendStatus(404);
    }

    res.sendFile(wallpaper, (err) => {
      if (err) {
        console.error("SEND FILE ERROR:", err);
      }
    });
  });

  app.get("/pitch-processor", (req, res) => {
    try {
      const file = app.isPackaged
        ? path.join(app.getAppPath(), "dist", "pitch-processor.js")
        : path.join(process.cwd(), "public", "pitch-processor.js");

      console.log("================================");
      console.log("PACKAGED:", app.isPackaged);
      console.log("DIRNAME:", __dirname);
      console.log("PITCH FILE:", file);
      console.log("EXISTS:", fs.existsSync(file));
      console.log("================================");

      if (!fs.existsSync(file)) {
        return res.status(404).send("pitch-processor.js not found");
      }

      const code = fs.readFileSync(file, "utf8");

      res.setHeader("Content-Type", "application/javascript; charset=utf-8");

      res.setHeader("Access-Control-Allow-Origin", "*");

      res.send(code);
    } catch (error) {
      console.error("PITCH PROCESSOR ERROR:", error);

      res.status(500).send(error.message);
    }
  });

  app.get("/metadata", (req, res) => {
    try {
      const file = req.query.file;

      if (!file) {
        return res.status(400).json({
          message: "File required",
        });
      }

      if (!fs.existsSync(file)) {
        return res.status(404).json({
          message: "File not found",
          file,
        });
      }

      const ffprobe = spawn(
        ffprobePath,
        [
          "-v",
          "error",
          "-show_entries",
          "format=duration",
          "-of",
          "default=noprint_wrappers=1:nokey=1",
          file,
        ],
        {
          windowsHide: true,
        },
      );

      let output = "";
      let errorOutput = "";

      ffprobe.stdout.on("data", (data) => {
        output += data.toString();
      });

      ffprobe.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      ffprobe.on("error", (err) => {
        console.error("FFPROBE SPAWN ERROR:", err);

        if (!res.headersSent) {
          res.status(500).json({
            message: "Gagal menjalankan ffprobe",
            error: err.message,
          });
        }
      });

      ffprobe.on("close", (code) => {
        if (res.headersSent) return;

        if (code !== 0) {
          return res.status(500).json({
            message: "FFprobe gagal membaca video",
            error: errorOutput,
          });
        }

        const duration = parseFloat(output.trim());

        if (!Number.isFinite(duration)) {
          return res.status(500).json({
            message: "Durasi video tidak valid",
            output,
          });
        }

        res.json({
          duration,
        });
      });
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/background", (req, res) => {
    const config = getConfig();

    const file = config.background;

    if (!file || !fs.existsSync(file)) {
      return res.sendStatus(404);
    }

    res.sendFile(path.resolve(file));
  });

  app.get("/stream", (req, res) => {
    const file = req.query.file;
    const start = Number(req.query.start) || 0;

    if (!file) {
      return res.status(400).send("File required");
    }

    if (!fs.existsSync(file)) {
      return res.status(404).send("File not found");
    }

    const ext = path.extname(file).toLowerCase();
    // File yang biasanya bisa langsung dimainkan Chromium
    if ([".mp4", ".webm"].includes(ext)) {
      console.log(ext);

      return streamOriginal(file, req, res);
    }

    // AVI / MPG / MPEG / MKV dll
    return transcode(file, req, res, start);
  });

  // yt
  // app.get("/youtube/stream", (req, res) => {
  //   const id = String(req.query.id || "").trim();

  //   if (!id) {
  //     return res.status(400).send("YouTube ID required");
  //   }

  //   return streamYoutube(id, req, res);
  // });

  server = app.listen(8765, "127.0.0.1", () => {
    console.log("================================");
    console.log("STARTING VIDEO SERVER");
    console.log("http://127.0.0.1:8765");
    console.log("================================");
  });
}

function streamOriginal(file, req, res) {
  fs.stat(file, (err, stat) => {
    if (err) {
      return res.sendStatus(404);
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    const contentType = mime.lookup(file) || "application/octet-stream";

    if (!range) {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      });

      return fs.createReadStream(file).pipe(res);
    }

    const parts = range.replace(/bytes=/, "").split("-");

    const start = parseInt(parts[0], 10);

    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (Number.isNaN(start) || start >= fileSize) {
      res.writeHead(416, {
        "Content-Range": `bytes */${fileSize}`,
      });

      return res.end();
    }

    const safeEnd = Math.min(end, fileSize - 1);

    const chunkSize = safeEnd - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${safeEnd}/${fileSize}`,

      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
    });

    const stream = fs.createReadStream(file, {
      start,
      end: safeEnd,
    });

    stream.pipe(res);
  });
}

function transcode(file, req, res, start = 0) {
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Cache-Control": "no-cache",
    "Transfer-Encoding": "chunked",
  });

  const ffmpeg = spawn(
    ffmpegPath,
    [
      "-hide_banner",

      // SEEK INPUT
      ...(start > 0 ? ["-ss", String(start)] : []),

      "-i",
      file,

      "-map",
      "0:v:0",

      "-map",
      "0:a:0?",

      // VIDEO
      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-tune",
      "zerolatency",

      "-pix_fmt",
      "yuv420p",

      // AUDIO
      "-c:a",
      "aac",

      "-b:a",
      "192k",

      "-ac",
      "2",

      // Streaming MP4
      "-movflags",
      "frag_keyframe+empty_moov+default_base_moof",

      "-f",
      "mp4",

      "pipe:1",
    ],
    {
      windowsHide: true,
    },
  );

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", (data) => {
    console.log("[FFMPEG]", data.toString());
  });

  ffmpeg.on("error", (err) => {
    if (!res.headersSent) {
      res.sendStatus(500);
    }
  });

  ffmpeg.on("close", (code) => {
    if (!res.writableEnded) {
      res.end();
    }
  });

  // Stop FFmpeg kalau React pindah lagu
  req.on("close", () => {
    if (!ffmpeg.killed) {
      ffmpeg.kill();
    }
  });
}

function stopLocalVideoServer() {
  if (!server) return;

  server.close();

  server = null;
}

module.exports = {
  startLocalVideoServer,
  stopLocalVideoServer,
};
