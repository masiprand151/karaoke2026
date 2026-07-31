const { spawn, exec } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const mime = require("mime-types");
const fs = require("fs");
const path = require("path");

// Streaming video/audio
function streamOriginal(file, req, res) {
  fs.stat(file, (err, stats) => {
    if (err) {
      return res.sendStatus(404);
    }

    const fileSize = stats.size;
    const range = req.headers.range;
    const contentType = mime.lookup(file) || "video/mp4";

    if (!range) {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      });

      return fs.createReadStream(file).pipe(res);
    }

    const parts = range.replace(/bytes=/, "").split("-");

    const start = parseInt(parts[0], 10);

    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start >= fileSize) {
      res.writeHead(416, {
        "Content-Range": `bytes */${fileSize}`,
      });

      return res.end();
    }

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
    });

    fs.createReadStream(file, {
      start,
      end,
    }).pipe(res);
  });
}

function transcodeVideo(file, req, res) {
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Cache-Control": "no-cache",
    "Transfer-Encoding": "chunked",
  });

  const ffmpeg = spawn(ffmpegPath, [
    "-i",
    file,

    "-map",
    "0:v:0",

    "-map",
    "0:a:0?",

    "-c:v",
    "libx264",

    "-preset",
    "veryfast",

    "-tune",
    "zerolatency",

    "-pix_fmt",
    "yuv420p",

    "-c:a",
    "aac",

    "-b:a",
    "192k",

    "-movflags",
    "frag_keyframe+empty_moov+default_base_moof",

    "-f",
    "mp4",

    "pipe:1",
  ]);

  ffmpeg.stdout.pipe(res);

  // ffmpeg.stderr.on("data", (data) => {
  //   console.log(data.toString());
  // });

  ffmpeg.on("error", (err) => {
    if (!res.headersSent) {
      res.status(500).end();
    }
  });

  ffmpeg.on("close", (code) => {
    if (!res.writableEnded) {
      res.end();
    }
  });

  req.on("close", () => {
    if (!ffmpeg.killed) {
      ffmpeg.kill();
    }
  });
}

module.exports = { streamOriginal, transcodeVideo };
