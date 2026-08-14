const { spawn } = require("child_process");

function searchYoutube(ytDlpPath, keyword, limit = 10) {
  return new Promise((resolve, reject) => {
    console.log(keyword, "lkkk");

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
      console.error("[YT-DLP SPAWN ERROR]", err);

      reject(err);
    });

    processYtDlp.on("close", (code) => {
      console.log("[YT-DLP EXIT]", code);

      if (code !== 0) {
        return reject(new Error(error || `yt-dlp exit code ${code}`));
      }

      if (!output.trim()) {
        return reject(new Error("yt-dlp tidak menghasilkan output"));
      }

      try {
        const result = JSON.parse(output);

        const videos = (result.entries || []).filter(Boolean).map((item) => ({
          id: item.id,

          name: item.title,

          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,

          artist: "youtube",

          thumbnail:
            item.thumbnail || `https://i.ytimg.com/vi/${item.id}/default.jpg`,
          duration: Number(item.duration) || 0,
          source: "youtube",
        }));

        resolve(videos);
      } catch (err) {
        console.error("[YT JSON ERROR]", err);

        console.error("[YT RAW]", output.substring(0, 1000));

        reject(err);
      }
    });
  });
}

module.exports = {
  searchYoutube,
};
