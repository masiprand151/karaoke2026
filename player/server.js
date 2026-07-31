const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const mime = require("mime-types");

let server = null;

function startLocalVideoServer() {
  if (server) return;

  const app = express();

  app.get("/stream", (req, res) => {
    const file = req.query.file;

    if (!file) {
      return res.status(400).send("File required");
    }

    if (!fs.existsSync(file)) {
      return res.status(404).send("File not found");
    }

    const ext = path.extname(file).toLowerCase();
    // File yang biasanya bisa langsung dimainkan Chromium
    if ([".mp4", ".webm"].includes(ext)) {
      return streamOriginal(file, req, res);
    }

    // AVI / MPG / MPEG / MKV dll
    return transcode(file, req, res);
  });

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

function transcode(file, req, res) {
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Cache-Control": "no-cache",
    "Transfer-Encoding": "chunked",
  });

  const ffmpeg = spawn(
    ffmpegPath,
    [
      "-hide_banner",

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
    // console.log("[FFMPEG]", data.toString());
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
