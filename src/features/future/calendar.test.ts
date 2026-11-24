/**
 * IST week boundaries and month grids (Monday first).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { addMonths, istDate, monthGrid, startOfWeek, weekDays, weekLabel } from "./dates";

const ist = (local: string) => Date.parse(`${local}+05:30`);
const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday

test("weeks start on Monday", () => {
  assert.equal(startOfWeek("2026-11-23"), "2026-11-23"); // Monday
  assert.equal(startOfWeek("2026-11-24"), "2026-11-23");
  assert.equal(startOfWeek("2026-11-29"), "2026-11-23"); // Sunday
  assert.equal(startOfWeek("2026-11-30"), "2026-11-30");
  assert.equal(startOfWeek("2027-01-01"), "2026-12-28"); // across the year
  assert.deepEqual(weekDays("2026-11-23"), ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"]);
});

test("the week turns at midnight IST: Sunday 23:59 → Monday 00:01", () => {
  const sunday = istDate(ist("2026-11-29T23:59:00"));
  const monday = istDate(ist("2026-11-30T00:01:00")); // still Sunday in UTC

  assert.equal(sunday, "2026-11-29");
  assert.equal(monday, "2026-11-30");
  assert.equal(startOfWeek(sunday), "2026-11-23");
  assert.equal(startOfWeek(monday), "2026-11-30");
});

test("week labels, within and across months", () => {
  assert.equal(weekLabel("2026-11-23"), "23 – 29 Nov");
  assert.equal(weekLabel("2026-11-30"), "30 Nov – 6 Dec");
});

function checkGrid(month: string) {
  const grid = monthGrid(month);
  assert.equal(grid.length % 7, 0, month);
  assert.equal(weekday(grid[0]), 1, `${month} starts on Monday`);
  assert.equal(weekday(grid[grid.length - 1]), 0, `${month} ends on Sunday`);
  for (let index = 1; index < grid.length; index += 1) {
    assert.equal(Date.parse(grid[index]) - Date.parse(grid[index - 1]), 86_400_000);
  }
  return { grid, inMonth: grid.filter((date) => date.startsWith(month)) };
}

test("a month that starts on Sunday needs six rows", () => {
  const { grid, inMonth } = checkGrid("2026-11"); // 1 Nov 2026 is a Sunday
  assert.equal(grid[0], "2026-10-26");
  assert.equal(grid.length, 42);
  assert.equal(inMonth.length, 30);
});

test("28, 29, 30 and 31-day months, including a leap year", () => {
  const february = checkGrid("2027-02"); // starts Monday, 28 days: exactly four rows
  assert.equal(february.grid.length, 28);
  assert.equal(february.inMonth.length, 28);

  const leap = checkGrid("2028-02");
  assert.equal(leap.inMonth.length, 29);
  assert.ok(leap.grid.includes("2028-02-29"));

  assert.equal(checkGrid("2026-04").inMonth.length, 30);
  assert.equal(checkGrid("2026-03").inMonth.length, 31);
  assert.equal(checkGrid("2026-12").inMonth.length, 31);
});

test("moving between months, across years", () => {
  assert.equal(addMonths("2026-11", 1), "2026-12");
  assert.equal(addMonths("2026-12", 1), "2027-01");
  assert.equal(addMonths("2027-01", -1), "2026-12");
  assert.equal(addMonths("2026-11", -11), "2025-12");
  assert.equal(addMonths("2026-11", 14), "2028-01");
});
