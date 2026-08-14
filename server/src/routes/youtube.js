const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");
const path = require("path");
const YouTubeManager = require("../helpers/youtubeManager");
// const ffmpegPath = require("ffmpeg-static");
const { searchYoutube } = require("../helpers/youtubeSearch");
const { streamYoutube } = require("../helpers/youtubeStream");

// init
const ytDlpPath = path.join(__dirname, "..", "..", "bin", "yt-dlp.exe");
const youtubeManager = new YouTubeManager({
  search: (query, limit) => {
    return searchYoutube(ytDlpPath, `karaoke ${query}`, limit);
  },

  stream: (job) =>
    streamYoutube({
      job,
      ytDlpPath,
    }),

  searchCacheTtl: 5 * 60 * 1000,

  maxConcurrent: 2,
});

route.get("/search", async (req, res, next) => {
  try {
    const q = String(req.query.q || "karaoke").trim();

    const limit = Math.min(Number(req.query.limit || 10), 20);

    const result = await youtubeManager.search(q, limit);

    res.json(result);
  } catch (error) {
    console.error("[YOUTUBE SEARCH ERROR]", error);

    next(error);
  }
});

route.get("/stream", async (req, res, next) => {
  try {
    const id = String(req.query.id || "").trim();

    const roomId = String(req.query.roomId || "").trim();
    const start = Number(req.query.start || 0);

    if (!id) {
      return res.status(400).send("YouTube ID required");
    }

    if (!roomId) {
      return res.status(400).send("Room ID required");
    }

    await youtubeManager.stream({
      roomId,
      videoId: id,
      start,
      req,
      res,
    });
  } catch (error) {
    console.error("[YOUTUBE STREAM ERROR]", error);

    if (!res.headersSent) {
      next(error);
    }
  }
});

module.exports = route;
