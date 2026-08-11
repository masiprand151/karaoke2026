const path = require("path");
const { spawn } = require("child_process");
const { app } = require("electron");

function getYtDlpPath() {
  // DEVELOPMENT
  if (!app.isPackaged) {
    return path.join(process.cwd(), "yt-dlp.exe");
  }

  // PRODUCTION / sudah build
  return path.join(
    process.env.PROGRAMDATA || "C:\\ProgramData",
    "player",
    "yt-dlp.exe",
  );

  // if (process.env.NODE_ENV === "development") {
  //   return path.join(process.cwd(), "yt-dlp.exe");
  // }

  // return path.join(process.resourcesPath, "yt-dlp.exe");
}

function checkYtDlp() {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath();

    const processYtDlp = spawn(ytDlpPath, ["--version"], {
      windowsHide: true,
    });

    let output = "";
    let error = "";

    processYtDlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    processYtDlp.stderr.on("data", (data) => {
      error += data.toString();
    });

    processYtDlp.on("error", (err) => {
      reject(err);
    });

    processYtDlp.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(error || `yt-dlp exit code ${code}`));
      }

      resolve(output.trim());
    });
  });
}

function searchYoutube(keyword, limit = 10) {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath();

    const args = [
      `ytsearch${limit}:${keyword}`,

      "--flat-playlist",
      "--dump-single-json",
      "--skip-download",
      "--no-warnings",
      "--quiet",
    ];

    const processYtDlp = spawn(ytDlpPath, args, {
      windowsHide: true,
    });

    let output = "";
    let error = "";

    processYtDlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    processYtDlp.stderr.on("data", (data) => {
      error += data.toString();
    });

    processYtDlp.on("error", (err) => {
      reject(err);
    });

    processYtDlp.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(error || `yt-dlp exit code ${code}`));
      }

      try {
        const result = JSON.parse(output);

        // https://www.youtube.com/results?search_query=karaoke

        const videos = (result.entries || []).map((item) => ({
          id: item.id,
          name: item.title,
          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
          artist: "youtube",
          thumbnail:
            item.thumbnail || `https://i.ytimg.com/vi/${item.id}/default.jpg`,
        }));

        resolve(videos);
      } catch (err) {
        console.log(err);

        reject(err);
      }
    });
  });
}

function streamYoutube(id, req, res) {
  const ytDlpPath = getYtDlpPath();

  const url = `https://www.youtube.com/watch?v=${id}`;

  const args = [
    url,

    "--no-playlist",
    "--no-warnings",
    "--quiet",

    // Ambil satu format yang sudah berupa video+audio
    "-f",
    "best[ext=mp4]/best",

    // Output media ke stdout
    "-o",
    "-",
  ];

  console.log("YOUTUBE STREAM:", url);

  const ytdlp = spawn(ytDlpPath, args, {
    windowsHide: true,
  });

  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Cache-Control": "no-cache",
    "Accept-Ranges": "none",
  });

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (data) => {
    console.log("[YT-DLP]", data.toString());
  });

  ytdlp.on("error", (error) => {
    console.error("YT-DLP ERROR:", error);

    if (!res.headersSent) {
      res.sendStatus(500);
    }
  });

  ytdlp.on("close", (code) => {
    console.log("YT-DLP CLOSED:", code);

    if (!res.writableEnded) {
      res.end();
    }
  });

  // Browser/video berganti lagu atau ditutup
  req.on("close", () => {
    if (!ytdlp.killed) {
      console.log("STOP YOUTUBE:", id);

      ytdlp.kill("SIGKILL");
    }
  });
}

module.exports = {
  getYtDlpPath,
  checkYtDlp,
  searchYoutube,
  streamYoutube,
};
