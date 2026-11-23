import test from "node:test";
import assert from "node:assert/strict";
import {
  averageMeasured,
  currentStreak,
  filterSessions,
  summarizeSessions,
} from "../../client/src/lib/session-metrics";
import {
  setLocalAccount,
  writeLocal,
  readLocal,
  hasLegacyData,
  importLegacyData,
} from "../../client/src/lib/local-data";
import {
  loadSessionHistory,
  upsertSessionRecord,
  type SessionRecord,
} from "../../client/src/lib/session-history";
const values = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  },
});
const record: SessionRecord = {
  id: "one",
  date: "2026-11-22T10:00:00.000Z",
  duration: 120,
  notes: "Notes",
  status: "completed",
};
test("missing camera measurements stay unknown and incomplete sessions are not completed", () => {
  const result = summarizeSessions([
    record,
    { ...record, id: "two", status: "paused" },
  ]);
  assert.equal(result.camera, null);
  assert.equal(result.pace, null);
  assert.equal(result.completed, 1);
  assert.equal(averageMeasured([null, 0, 100]), 50);
});
test("timeframe filtering excludes older and future sessions", () => {
  const sessions = [
    record,
    { ...record, id: "old", date: "2026-10-01" },
    { ...record, id: "future", date: "2027-01-01" },
  ];
  assert.deepEqual(
    filterSessions(sessions, "7d", new Date("2026-11-22T12:00:00Z")).map(
      (s) => s.id,
    ),
    ["one"],
  );
});
test("a stale streak is zero and yesterday can continue a streak", () => {
  const now = new Date(2026, 10, 22, 12);
  assert.equal(currentStreak([new Date(2026, 10, 10).toISOString()], now), 0);
  assert.equal(
    currentStreak(
      [
        new Date(2026, 10, 21).toISOString(),
        new Date(2026, 10, 20).toISOString(),
      ],
      now,
    ),
    2,
  );
});
test("local sessions, notes, and bookmarks are isolated by account", () => {
  values.clear();
  setLocalAccount("first");
  upsertSessionRecord(record);
  writeLocal("bookmarks:Job", '["saved"]');
  setLocalAccount("second");
  assert.equal(loadSessionHistory().length, 0);
  assert.equal(readLocal("bookmarks:Job"), null);
  setLocalAccount("first");
  assert.equal(loadSessionHistory()[0].notes, "Notes");
  assert.equal(readLocal("bookmarks:Job"), '["saved"]');
});
test("legacy data is never silently assigned, and import preserves existing data", () => {
  values.clear();
  values.set(
    "sessionHistory",
    JSON.stringify([{ ...record, status: undefined }]),
  );
  setLocalAccount("legacy-owner");
  assert.equal(loadSessionHistory().length, 0);
  assert.equal(hasLegacyData(), true);
  assert.equal(importLegacyData(), true);
  assert.equal(loadSessionHistory()[0].status, undefined);
  assert.ok(values.has("sessionHistory"));
  assert.equal(hasLegacyData(), false);
  setLocalAccount("other");
  assert.equal(importLegacyData(), false);
  assert.equal(loadSessionHistory().length, 0);
});
test("invalid history is ignored and the latest ten records are retained", () => {
  values.clear();
  setLocalAccount("history");
  writeLocal("sessionHistory", "{broken");
  assert.deepEqual(loadSessionHistory(), []);
  for (let i = 0; i < 12; i++)
    upsertSessionRecord({ ...record, id: String(i) });
  assert.equal(loadSessionHistory().length, 10);
  assert.equal(loadSessionHistory()[0].id, "11");
});

test("storage failures keep data for the current visit and allow a draft to be cleared", () => {
  const original = globalThis.localStorage;
  setLocalAccount("storage-unavailable");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => "stale",
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    },
  });
  try {
    assert.equal(writeLocal("sessionNotes", "draft"), false);
    assert.equal(readLocal("sessionNotes"), "draft");
    assert.equal(writeLocal("sessionNotes", null), false);
    assert.equal(readLocal("sessionNotes"), null);
  } finally {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: original,
    });
  }
});
