import { test } from "node:test";
import assert from "node:assert/strict";
import {
  seedState,
  joinMatch,
  confirmMatch,
  trustSummary,
  visibleMatches,
  sendChat,
  isChatReadOnly,
  localDay,
  parseStored,
  type DemoState,
} from "../src/lib/demo";
const now = new Date("2026-10-13T10:00:00Z");
function setup(): DemoState {
  return {
    ...seedState(now),
    profile: { name: "Minh", district: "Thủ Đức", times: ["19:00 – 21:00"] },
  };
}
test("join increments one slot and rejects duplicate participation", () => {
  const state = joinMatch(setup(), "k1", now);
  assert.equal(state.matches.find((m) => m.id === "k1")?.filled, 9);
  assert.throws(() => joinMatch(state, "k1", now), /đã tham gia/);
});
test("last slot becomes full and cannot be overbooked sequentially", () => {
  const joined = joinMatch(setup(), "k2", now);
  assert.equal(joined.matches.find((m) => m.id === "k2")?.filled, 10);
  assert.throws(
    () => joinMatch({ ...joined, members: [] }, "k2", now),
    /đã đủ người/,
  );
});
test("join requires profile, available capacity and a future match", () => {
  assert.throws(() => joinMatch(seedState(now), "k1", now), /hồ sơ/);
  assert.throws(() => joinMatch(setup(), "k6", now), /đã đủ người/);
  assert.throws(() => joinMatch(setup(), "k7", now), /qua giờ/);
});
test("filter respects Vietnam calendar date and calendar week", () => {
  assert.equal(localDay(new Date("2026-10-13T18:00:00Z")), "2026-10-14");
  const matches = visibleMatches(setup(), "today", "Thủ Đức", now);
  assert.deepEqual(
    matches.map((m) => m.id),
    ["k1", "k2", "k3"],
  );
  assert.equal(visibleMatches(setup(), "week", "Bình Thạnh", now).length, 0);
  const sunday = new Date("2026-10-18T10:00:00Z");
  assert.ok(
    visibleMatches(seedState(sunday), "week", "Thủ Đức", sunday).every(
      (m) => localDay(new Date(m.start)) === "2026-10-18",
    ),
  );
});
test("cannot confirm before kickoff; confirm is idempotent and trust is derived", () => {
  const joined = joinMatch(setup(), "k1", now);
  assert.throws(() => confirmMatch(joined, "k1", true, now), /sau giờ/);
  const confirmed = confirmMatch(joined, "k7", true, now);
  assert.deepEqual(trustSummary(confirmed, now), {
    played: 1,
    attendance: 100,
  });
  assert.deepEqual(
    trustSummary(confirmMatch(confirmed, "k7", true, now), now),
    { played: 1, attendance: 100 },
  );
  assert.deepEqual(
    trustSummary(confirmMatch(confirmed, "k7", false, now), now),
    { played: 0, attendance: 0 },
  );
});
test("chat requires membership, validates length, locks after 24 hours", () => {
  assert.throws(() => sendChat(setup(), "k1", "Hello", now), /Tham gia/);
  const joined = joinMatch(setup(), "k1", now);
  const sent = sendChat(joined, "k1", "Hẹn anh em ở sân!", now);
  assert.equal(sent.messages.k1.at(-1)?.text, "Hẹn anh em ở sân!");
  assert.throws(() => sendChat(joined, "k1", " ", now));
  assert.throws(() => sendChat(joined, "k1", "a".repeat(1001), now));
  const later = new Date("2026-10-14T13:00:00Z");
  assert.equal(isChatReadOnly(joined.matches[0], later), true);
  assert.throws(() => sendChat(joined, "k1", "Late", later), /chỉ đọc/);
});
test("storage round trips valid demo data and discards malformed values", () => {
  const state = setup();
  assert.deepEqual(parseStored(JSON.stringify(state)), state);
  assert.equal(parseStored("bad json"), null);
  assert.equal(parseStored('{"version":1}'), null);
  assert.equal(
    parseStored(
      JSON.stringify({
        ...state,
        matches: [{ ...state.matches[0], filled: 500 }],
      }),
    ),
    null,
  );
});
