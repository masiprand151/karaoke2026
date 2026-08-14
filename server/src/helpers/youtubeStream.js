const { spawn } = require("child_process");
const axios = require("axios");

function getYoutubeMediaUrl(ytDlpPath, videoId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    const args = [
      url,

      "--no-playlist",
      "--no-warnings",
      "--quiet",

      "-f",
      "best[ext=mp4]/best",

      "-g",
    ];

    const ytdlp = spawn(ytDlpPath, args, {
      windowsHide: true,
    });

    let output = "";
    let error = "";

    ytdlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on("data", (data) => {
      error += data.toString();
    });

    ytdlp.on("error", reject);

    ytdlp.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(error || `yt-dlp exit ${code}`));
      }

      const mediaUrl = output.trim().split(/\r?\n/).find(Boolean);

      if (!mediaUrl) {
        return reject(new Error("YouTube media URL tidak ditemukan"));
      }

      resolve(mediaUrl);
    });
  });
}

async function streamYoutube({ job, ytDlpPath }) {
  const { videoId, req, res } = job;

  console.log("[YT STREAM]", job.roomId, videoId);

  try {
    // ==========================================
    // AMBIL DIRECT MEDIA URL
    // ==========================================

    const mediaUrl = await getYoutubeMediaUrl(ytDlpPath, videoId);

    console.log("[YT MEDIA URL READY]", videoId);

    // ==========================================
    // RANGE DARI BROWSER
    // ==========================================

    const range = req.headers.range;

    console.log("================================");
    console.log("[YT RANGE]", range);
    console.log("[YT VIDEO]", videoId);
    console.log("================================");

    const headers = {};

    if (range) {
      headers.Range = range;
    }

    // ==========================================
    // REQUEST KE YOUTUBE
    // ==========================================

    const response = await axios({
      method: "GET",
      url: mediaUrl,

      headers,

      responseType: "stream",

      validateStatus: () => true,
    });

    console.log("[YT HTTP STATUS]", response.status);
    console.log("[YT STATUS]", response.status);
    console.log("[YT CONTENT-TYPE]", response.headers["content-type"]);
    console.log("[YT ACCEPT-RANGES]", response.headers["accept-ranges"]);
    console.log("[YT CONTENT-LENGTH]", response.headers["content-length"]);
    console.log("[YT CONTENT-RANGE]", response.headers["content-range"]);
    // ==========================================
    // FORWARD HEADER
    // ==========================================

    const responseHeaders = {
      "Content-Type": response.headers["content-type"] || "video/mp4",

      "Accept-Ranges": response.headers["accept-ranges"] || "bytes",

      "Cache-Control": "no-cache",
    };

    if (response.headers["content-length"]) {
      responseHeaders["Content-Length"] = response.headers["content-length"];
    }

    if (response.headers["content-range"]) {
      responseHeaders["Content-Range"] = response.headers["content-range"];
    }

    // ==========================================
    // RESPONSE STATUS
    // ==========================================

    res.writeHead(response.status, responseHeaders);

    // ==========================================
    // YOUTUBE → PLAYER
    // ==========================================

    response.data.pipe(res);

    // ==========================================
    // PLAYER DISCONNECT
    // ==========================================

    req.on("close", () => {
      console.log("[YT CLIENT CLOSED]", job.roomId, videoId);

      response.data.destroy();
    });

    response.data.on("error", (error) => {
      if (error.code === "ECONNRESET") {
        return;
      }

      console.error("[YT STREAM ERROR]", error);
    });

    response.data.on("end", () => {
      if (!res.writableEnded) {
        res.end();
      }
    });
  } catch (error) {
    console.error("[YT STREAM ERROR]", error.message);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Gagal mengambil stream YouTube",
        error: error.message,
      });
    }
  }
}

module.exports = {
  streamYoutube,
};
