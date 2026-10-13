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

// Each city's ride count on one date next to its usual (average) ride count, sorted by city name.
// change is the difference as a fraction of usual (0.2 = 20% above); rides and change are null
// for a city with no row on that date.
export function dayVsUsual(rows, date) {
  const days = new Map();
  for (const row of rows) days.set(row.city, (days.get(row.city) ?? 0) + 1);
  return ridesByCity(rows).map(({ city, rides: total }) => {
    const usual = total / days.get(city);
    const row = rows.find((r) => r.city === city && r.date === date);
    const rides = row ? Number(row.rides) : null;
    return { city, rides, usual, change: rides === null ? null : (rides - usual) / usual };
  });
}
