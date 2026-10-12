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
