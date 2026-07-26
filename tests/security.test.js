import test from "node:test";
import assert from "node:assert/strict";
import { getDayKey, hashIdentifier, timingSafeTextEqual, xmlEscape } from "../functions/_lib/security.js";

test("uses the chosen timezone for the calendar day", () => {
  const moment = new Date("2026-07-25T23:30:00Z");
  assert.equal(getDayKey("Europe/London", moment), "2026-07-26");
  assert.equal(getDayKey("UTC", moment), "2026-07-25");
});

test("hashes identifiers deterministically with a salt", async () => {
  const salt = "0123456789abcdef0123456789abcdef";
  const a = await hashIdentifier("Test@Example.com", salt);
  const b = await hashIdentifier("test@example.com", salt);
  assert.equal(a, b);
  assert.equal(a.length, 64);
});

test("requires a sufficiently long privacy salt", async () => {
  await assert.rejects(() => hashIdentifier("value", "short"), /SERVER_SALT_NOT_CONFIGURED/);
});

test("compares administrator keys", async () => {
  assert.equal(await timingSafeTextEqual("abc", "abc"), true);
  assert.equal(await timingSafeTextEqual("abc", "abd"), false);
});

test("escapes XML", () => {
  assert.equal(xmlEscape('<a href="x">&</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
});
