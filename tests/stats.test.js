import { test } from "node:test";
import assert from "node:assert/strict";
import { totalRides, ridesByCity, busiestDayByCity } from "../site/src/stats.js";

const rows = [
  { date: "2026-07-01", city: "Miami", rides: "10" },
  { date: "2026-07-01", city: "Boston", rides: "20" },
  { date: "2026-07-02", city: "Boston", rides: 30 },
];

test("totalRides sums the rides column", () => {
  assert.equal(totalRides(rows), 60);
});

test("ridesByCity totals per city in alphabetical order", () => {
  assert.deepEqual(ridesByCity(rows), [
    { city: "Boston", rides: 50 },
    { city: "Miami", rides: 10 },
  ]);
});

test("busiestDayByCity picks the date with the highest ride count", () => {
  const days = [
    { date: "2026-07-01", city: "Boston", rides: "20" },
    { date: "2026-07-02", city: "Boston", rides: "45" },
    { date: "2026-07-03", city: "Boston", rides: "30" },
  ];
  assert.deepEqual(busiestDayByCity(days), [
    { city: "Boston", date: "2026-07-02", rides: 45 },
  ]);
});

test("busiestDayByCity returns one entry per city in alphabetical order", () => {
  assert.deepEqual(busiestDayByCity(rows), [
    { city: "Boston", date: "2026-07-02", rides: 30 },
    { city: "Miami", date: "2026-07-01", rides: 10 },
  ]);
});

test("busiestDayByCity compares string and number ride counts numerically", () => {
  const days = [
    { date: "2026-07-01", city: "Denver", rides: "9" },
    { date: "2026-07-02", city: "Denver", rides: 10 },
  ];
  assert.deepEqual(busiestDayByCity(days), [
    { city: "Denver", date: "2026-07-02", rides: 10 },
  ]);
});

test("busiestDayByCity returns an empty list for no rows", () => {
  assert.deepEqual(busiestDayByCity([]), []);
});

test("busiestDayByCity uses the only day for a city with a single row", () => {
  assert.deepEqual(
    busiestDayByCity([{ date: "2026-09-30", city: "Austin", rides: "7" }]),
    [{ city: "Austin", date: "2026-09-30", rides: 7 }],
  );
});

test("busiestDayByCity breaks a tie with the earliest date when the later date comes first", () => {
  const days = [
    { date: "2026-08-29", city: "Boston", rides: "165" },
    { date: "2026-08-23", city: "Boston", rides: "165" },
  ];
  assert.deepEqual(busiestDayByCity(days), [
    { city: "Boston", date: "2026-08-23", rides: 165 },
  ]);
});

test("busiestDayByCity breaks a tie with the earliest date when the earlier date comes first", () => {
  const days = [
    { date: "2026-08-23", city: "Boston", rides: 165 },
    { date: "2026-08-29", city: "Boston", rides: 165 },
  ];
  assert.deepEqual(busiestDayByCity(days), [
    { city: "Boston", date: "2026-08-23", rides: 165 },
  ]);
});
