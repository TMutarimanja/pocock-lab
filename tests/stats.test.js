import { test } from "node:test";
import assert from "node:assert/strict";
import { totalRides, ridesByCity, busiestDayByCity, hotStreaks } from "../site/src/stats.js";

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

// Denver averages 10: above on Jul 2-3, below on Jul 4, above on Jul 5.
const denver = [
  { date: "2026-07-01", city: "Denver", rides: "5" },
  { date: "2026-07-02", city: "Denver", rides: "12" },
  { date: "2026-07-03", city: "Denver", rides: "14" },
  { date: "2026-07-04", city: "Denver", rides: "6" },
  { date: "2026-07-05", city: "Denver", rides: "13" },
];

test("hotStreaks finds each city's longest run of days above its usual ride count", () => {
  assert.deepEqual(hotStreaks(denver), [
    {
      city: "Denver",
      usual: 10,
      length: 2,
      start: "2026-07-02",
      end: "2026-07-03",
      days: [
        { date: "2026-07-01", rides: 5, above: false, inStreak: false },
        { date: "2026-07-02", rides: 12, above: true, inStreak: true },
        { date: "2026-07-03", rides: 14, above: true, inStreak: true },
        { date: "2026-07-04", rides: 6, above: false, inStreak: false },
        { date: "2026-07-05", rides: 13, above: true, inStreak: false },
      ],
    },
  ]);
});

test("hotStreaks keeps the earliest run when two runs are equally long, whatever the row order", () => {
  const twoRuns = [
    { date: "2026-07-04", city: "Miami", rides: "20" },
    { date: "2026-07-03", city: "Miami", rides: "0" },
    { date: "2026-07-01", city: "Miami", rides: "20" },
    { date: "2026-07-02", city: "Miami", rides: "0" },
  ];
  const [miami] = hotStreaks(twoRuns);
  assert.equal(miami.length, 1);
  assert.equal(miami.start, "2026-07-01");
});

test("hotStreaks breaks a streak across a missing date", () => {
  const gap = [
    { date: "2026-07-01", city: "Boston", rides: "30" },
    { date: "2026-07-03", city: "Boston", rides: "30" },
    { date: "2026-07-04", city: "Boston", rides: "0" },
  ];
  const [boston] = hotStreaks(gap);
  assert.equal(boston.length, 1);
  assert.equal(boston.start, "2026-07-01");
});

test("hotStreaks reports no streak for a city never above its usual", () => {
  const flat = [
    { date: "2026-07-01", city: "Boston", rides: "10" },
    { date: "2026-07-02", city: "Boston", rides: 10 },
  ];
  const [boston] = hotStreaks(flat);
  assert.deepEqual([boston.length, boston.start, boston.end], [0, null, null]);
});

test("hotStreaks lists cities alphabetically and is empty for no rows", () => {
  assert.deepEqual(hotStreaks(rows).map((s) => s.city), ["Boston", "Miami"]);
  assert.deepEqual(hotStreaks([]), []);
});
