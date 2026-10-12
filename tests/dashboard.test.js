import { test } from "node:test";
import assert from "node:assert/strict";
import {
  monthsIn,
  filterRows,
  dailySeries,
  weekdayAverages,
  cityStats,
  busiestOverall,
  niceMax,
  linePath,
} from "../site/src/dashboard.js";

const rows = [
  { date: "2026-07-31", city: "Miami", rides: "10" },
  { date: "2026-07-31", city: "Boston", rides: "20" },
  { date: "2026-08-01", city: "Boston", rides: 30 },
  { date: "2026-08-02", city: "Miami", rides: "40" },
];

test("monthsIn lists each month once in order", () => {
  assert.deepEqual(monthsIn(rows), ["2026-07", "2026-08"]);
});

test("filterRows keeps rows in the chosen month and cities", () => {
  assert.deepEqual(filterRows(rows, { month: "2026-08", cities: ["Boston"] }), [
    { date: "2026-08-01", city: "Boston", rides: 30 },
  ]);
});

test("filterRows with month 'all' keeps every month", () => {
  assert.equal(filterRows(rows, { month: "all", cities: ["Boston", "Miami"] }).length, 4);
});

test("dailySeries lines each city up on a shared, sorted date axis", () => {
  assert.deepEqual(dailySeries(rows), {
    dates: ["2026-07-31", "2026-08-01", "2026-08-02"],
    series: [
      { city: "Boston", values: [20, 30, null] },
      { city: "Miami", values: [10, null, 40] },
    ],
  });
});

test("dailySeries of no rows is empty", () => {
  assert.deepEqual(dailySeries([]), { dates: [], series: [] });
});

test("weekdayAverages averages each city's ride counts by weekday, Monday first", () => {
  // 2026-07-31 is a Friday, 2026-08-01 a Saturday, 2026-08-02 a Sunday.
  const more = [...rows, { date: "2026-08-07", city: "Boston", rides: "40" }];
  assert.deepEqual(weekdayAverages(more), [
    { city: "Boston", averages: [null, null, null, null, 30, 30, null] },
    { city: "Miami", averages: [null, null, null, null, 10, null, 40] },
  ]);
});

test("cityStats gives each city's total, daily average and busiest day", () => {
  assert.deepEqual(cityStats(rows), [
    { city: "Boston", total: 50, average: 25, busiest: { date: "2026-08-01", rides: 30 } },
    { city: "Miami", total: 50, average: 25, busiest: { date: "2026-08-02", rides: 40 } },
  ]);
});

test("niceMax rounds up to a tidy axis maximum", () => {
  assert.equal(niceMax(0), 10);
  assert.equal(niceMax(7), 10);
  assert.equal(niceMax(199), 200);
  assert.equal(niceMax(200), 200);
  assert.equal(niceMax(201), 250);
  assert.equal(niceMax(1234), 1500);
});

test("linePath scales values into the box with zero at the bottom", () => {
  assert.equal(linePath([0, 50, 100], { width: 200, height: 100, max: 100 }), "M0,100L100,50L200,0");
});

test("linePath starts a new segment after a missing value", () => {
  assert.equal(linePath([10, null, 10], { width: 20, height: 10, max: 10 }), "M0,0M20,0");
});

test("linePath centres a single value", () => {
  assert.equal(linePath([5], { width: 40, height: 10, max: 10 }), "M20,5");
});

test("busiestOverall picks the single busiest city-day, earliest date on a tie", () => {
  const tied = [...rows, { date: "2026-08-03", city: "Boston", rides: "40" }];
  assert.deepEqual(busiestOverall(tied), { city: "Miami", date: "2026-08-02", rides: 40 });
});

test("busiestOverall of no rows is null", () => {
  assert.equal(busiestOverall([]), null);
});
