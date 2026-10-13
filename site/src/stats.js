// Summaries of ride rows: [{ date, city, rides }, ...] with rides as strings or numbers.

export function totalRides(rows) {
  return rows.reduce((sum, row) => sum + Number(row.rides), 0);
}

// Total rides per city, sorted by city name.
export function ridesByCity(rows) {
  const totals = new Map();
  for (const row of rows) {
    totals.set(row.city, (totals.get(row.city) ?? 0) + Number(row.rides));
  }
  return [...totals.entries()]
    .map(([city, rides]) => ({ city, rides }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

// Each city's busiest day: the date with the highest ride count, sorted by city name.
// Ties go to the earliest date; ISO date strings compare in date order.
export function busiestDayByCity(rows) {
  const busiest = new Map();
  for (const row of rows) {
    const rides = Number(row.rides);
    const best = busiest.get(row.city);
    if (!best || rides > best.rides || (rides === best.rides && row.date < best.date)) {
      busiest.set(row.city, { city: row.city, date: row.date, rides });
    }
  }
  return [...busiest.values()].sort((a, b) => a.city.localeCompare(b.city));
}

// Each city's hot streak: its longest run of consecutive dates with a ride count above its
// usual (average) ride count, earliest run on a tie. A missing date breaks a run. days lists
// every date in order, flagged above usual and inside the streak. Sorted by city name.
export function hotStreaks(rows) {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const time = (date) => Date.parse(`${date}T00:00:00Z`);
  const byCity = new Map();
  for (const row of rows) {
    if (!byCity.has(row.city)) byCity.set(row.city, []);
    byCity.get(row.city).push({ date: row.date, rides: Number(row.rides) });
  }
  return [...byCity.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([city, entries]) => {
      entries.sort((a, b) => a.date.localeCompare(b.date));
      const usual = entries.reduce((sum, e) => sum + e.rides, 0) / entries.length;
      let best = { length: 0, from: -1 };
      let run = { length: 0, from: -1 };
      entries.forEach((entry, i) => {
        const continues = i > 0 && time(entry.date) - time(entries[i - 1].date) === ONE_DAY;
        if (entry.rides > usual) {
          run = continues && run.length > 0 ? { length: run.length + 1, from: run.from } : { length: 1, from: i };
          if (run.length > best.length) best = run;
        } else {
          run = { length: 0, from: -1 };
        }
      });
      const inStreak = (i) => best.length > 0 && i >= best.from && i < best.from + best.length;
      return {
        city,
        usual,
        length: best.length,
        start: best.length ? entries[best.from].date : null,
        end: best.length ? entries[best.from + best.length - 1].date : null,
        days: entries.map((e, i) => ({ date: e.date, rides: e.rides, above: e.rides > usual, inStreak: inStreak(i) })),
      };
    });
}
