// Timezone-aware streak helpers. A streak counts distinct calendar days
// (in the student's timezone), never multiple solves on the same day.
const dayKeyInTimezone = (date, timezone) => {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(new Date(date));
  } catch (e) {
    return new Date(date).toISOString().slice(0, 10);
  }
};

const addDays = (dayKey, n) => {
  const d = new Date(dayKey + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// sortedDayKeys: ascending unique YYYY-MM-DD strings. todayKey: YYYY-MM-DD
// in the student's timezone. Returns { current, longest }.
const computeStreaks = (sortedDayKeys, todayKey) => {
  if (!sortedDayKeys.length) return { current: 0, longest: 0 };
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDayKeys.length; i += 1) {
    if (sortedDayKeys[i] === addDays(sortedDayKeys[i - 1], 1)) {
      run += 1;
    } else if (sortedDayKeys[i] !== sortedDayKeys[i - 1]) {
      run = 1;
    }
    if (run > longest) longest = run;
  }
  const last = sortedDayKeys[sortedDayKeys.length - 1];
  if (last !== todayKey && last !== addDays(todayKey, -1)) {
    return { current: 0, longest };
  }
  let current = 1;
  for (let i = sortedDayKeys.length - 1; i > 0; i -= 1) {
    if (sortedDayKeys[i] === addDays(sortedDayKeys[i - 1], 1)) current += 1;
    else break;
  }
  return { current, longest };
};

module.exports = { dayKeyInTimezone, computeStreaks, addDays };
