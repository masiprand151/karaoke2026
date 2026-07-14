export function getRemainingTime(start, end) {
  if (!start || !end) {
    return {
      remainingMs: 0,
      elapsedMs: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      remainingText: "00:00:00",
      isExpired: true,
    };
  }

  const now = Date.now();

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  const totalDuration = endTime - startTime;
  const remaining = Math.max(endTime - now, 0);
  const elapsed = Math.min(now - startTime, totalDuration);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return {
    remainingMs: remaining,
    elapsedMs: elapsed,

    hours,
    minutes,
    seconds,

    remainingText: `${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,

    isExpired: remaining <= 0,
  };
}
