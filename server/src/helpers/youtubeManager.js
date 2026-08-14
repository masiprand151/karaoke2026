class YouTubeManager {
  constructor({
    search,
    stream,
    searchCacheTtl = 5 * 60 * 1000,
    maxConcurrent = 20, // security
  }) {
    this.searchHandler = search;
    this.streamHandler = stream;

    this.searchCacheTtl = searchCacheTtl;

    this.maxConcurrent = maxConcurrent;

    this.searchCache = new Map();

    this.queue = [];

    this.running = 0;

    this.activeJobs = new Map();
  }

  // ==========================================
  // SEARCH
  // ==========================================

  async search(query, limit = 10) {
    query = String(query || "").trim();

    if (!query) {
      return [];
    }

    const key = `${query.toLowerCase()}:${limit}`;

    const cached = this.searchCache.get(key);

    if (cached) {
      const age = Date.now() - cached.createdAt;

      if (age < this.searchCacheTtl) {
        return cached.data;
      }

      this.searchCache.delete(key);
    }

    const data = await this.searchHandler(query, limit);

    this.searchCache.set(key, {
      createdAt: Date.now(),
      data,
    });

    return data;
  }

  // ==========================================
  // STREAM
  // ==========================================

  stream({ roomId, videoId, req, res, start = 0 }) {
    return new Promise((resolve, reject) => {
      // kalau room sedang streaming
      const current = this.activeJobs.get(roomId);

      if (current) {
        if (current.videoId === videoId) {
          return current.attach(req, res);
        }

        this.cancel(roomId);
      }

      const job = {
        roomId,
        videoId,
        start,
        req,
        res,
        process: null,
        attach: null,
        resolve,
        reject,
      };

      this.queue.push(job);

      this.activeJobs.set(roomId, job);

      this.processQueue();
    });
  }

  // ==========================================
  // QUEUE
  // ==========================================

  processQueue() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const job = this.queue.shift();

      if (!job) continue;

      this.running++;

      this.streamHandler(job)
        .catch((error) => {
          job.reject(error);
        })
        .finally(() => {
          this.running--;

          const current = this.activeJobs.get(job.roomId);

          if (current === job) {
            this.activeJobs.delete(job.roomId);
          }

          this.processQueue();
        });
    }
  }

  // ==========================================
  // CANCEL
  // ==========================================

  cancel(roomId) {
    const job = this.activeJobs.get(roomId);

    if (!job) {
      return false;
    }

    if (job.process && !job.process.killed) {
      job.process.kill("SIGKILL");
    }

    const index = this.queue.indexOf(job);

    if (index !== -1) {
      this.queue.splice(index, 1);
    }

    this.activeJobs.delete(roomId);

    return true;
  }

  // ==========================================
  // CACHE
  // ==========================================

  clearCache() {
    this.searchCache.clear();
  }

  // ==========================================
  // STATS
  // ==========================================

  stats() {
    return {
      cache: this.searchCache.size,

      queue: this.queue.length,

      running: this.running,

      active: this.activeJobs.size,

      maxConcurrent: this.maxConcurrent,
    };
  }
}

module.exports = YouTubeManager;
