// Data shaping for the interactive dashboard: ride rows [{ date, city, rides }]
// in, plain chart-ready values out. Rides may be strings or numbers.
import { ridesByCity, busiestDayByCity } from "./stats.js";

// Distinct "YYYY-MM" months in the data, in date order.
export function monthsIn(rows) {
  return [...new Set(rows.map((row) => row.date.slice(0, 7)))].sort();
}

// Rows in the given month ("all" for every month) and in one of the given cities.
export function filterRows(rows, { month, cities }) {
  const wanted = new Set(cities);
  return rows.filter(
    (row) => wanted.has(row.city) && (month === "all" || row.date.startsWith(month)),
  );
}

// Daily ride counts per city on a shared, sorted date axis; null where a city has no row.
export function dailySeries(rows) {
  const dates = [...new Set(rows.map((row) => row.date))].sort();
  const index = new Map(dates.map((date, i) => [date, i]));
  const byCity = new Map();
  for (const row of rows) {
    if (!byCity.has(row.city)) byCity.set(row.city, dates.map(() => null));
    byCity.get(row.city)[index.get(row.date)] = Number(row.rides);
  }
  const series = [...byCity.entries()]
    .map(([city, values]) => ({ city, values }))
    .sort((a, b) => a.city.localeCompare(b.city));
  return { dates, series };
}

// Average ride count per weekday for each city, Monday first; null for a weekday with no rows.
export function weekdayAverages(rows) {
  const sums = new Map();
  for (const row of rows) {
    if (!sums.has(row.city)) sums.set(row.city, Array.from({ length: 7 }, () => ({ total: 0, days: 0 })));
    const weekday = (new Date(`${row.date}T00:00:00Z`).getUTCDay() + 6) % 7;
    const cell = sums.get(row.city)[weekday];
    cell.total += Number(row.rides);
    cell.days += 1;
  }
  return [...sums.entries()]
    .map(([city, cells]) => ({
      city,
      averages: cells.map(({ total, days }) => (days ? total / days : null)),
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

// Each city's total rides, average ride count per day, and busiest day, sorted by city name.
export function cityStats(rows) {
  const days = new Map();
  for (const row of rows) days.set(row.city, (days.get(row.city) ?? 0) + 1);
  const busiest = new Map(busiestDayByCity(rows).map((b) => [b.city, b]));
  return ridesByCity(rows).map(({ city, rides }) => ({
    city,
    total: rides,
    average: rides / days.get(city),
    busiest: { date: busiest.get(city).date, rides: busiest.get(city).rides },
  }));
}

// The single busiest city-day across all cities; ties go to the earliest date, then city name.
export function busiestOverall(rows) {
  const best = busiestDayByCity(rows).sort((a, b) => b.rides - a.rides || a.date.localeCompare(b.date));
  return best[0] ?? null;
}

// The smallest tidy axis maximum (1, 1.5, 2, 2.5 or 5 times a power of ten) at or above n.
export function niceMax(n) {
  if (n <= 0) return 10;
  const power = 10 ** Math.floor(Math.log10(n));
  const step = [1, 1.5, 2, 2.5, 5, 10].find((s) => s * power >= n);
  return Math.max(10, step * power);
}

// SVG path data for values spread evenly across width, 0 at the bottom and max at the top.
// A null value breaks the line; a single value sits in the middle.
export function linePath(values, { width, height, max }) {
  const round = (n) => Math.round(n * 10) / 10;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  let path = "";
  let drawing = false;
  values.forEach((value, i) => {
    if (value === null) {
      drawing = false;
      return;
    }
    const x = values.length > 1 ? i * stepX : width / 2;
    const y = height - (value / max) * height;
    path += `${drawing ? "L" : "M"}${round(x)},${round(y)}`;
    drawing = true;
  });
  return path;
}
