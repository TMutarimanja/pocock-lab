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
export function busiestDayByCity(rows) {
  const busiest = new Map();
  for (const row of rows) {
    const rides = Number(row.rides);
    const best = busiest.get(row.city);
    if (!best || rides > best.rides) {
      busiest.set(row.city, { city: row.city, date: row.date, rides });
    }
  }
  return [...busiest.values()].sort((a, b) => a.city.localeCompare(b.city));
}
