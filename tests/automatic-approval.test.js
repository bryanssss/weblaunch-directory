import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/submit.js";

test("a valid submission is inserted as approved and receives a live slug", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const target = String(url);
    if (target.includes("turnstile/v0/siteverify")) {
      return new Response(JSON.stringify({ success: true }), { headers: { "content-type": "application/json" } });
    }
    return new Response("<!doctype html><title>Useful Tool</title><p>A safe and useful independent website.</p>", {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  };

  const batches = [];
  const DB = {
    prepare(sql) {
      return {
        bind(...args) { return { sql, args }; },
        run() { return Promise.resolve({ meta: { changes: 0 } }); }
      };
    },
    async batch(statements) {
      batches.push(statements);
      if (batches.length === 1) return [{ results: [] }, { results: [] }, { results: [] }];
      return statements.map(() => ({ results: [], meta: { changes: 1 } }));
    }
  };

  const request = new Request("https://directory.test/api/submit", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.5" },
    body: JSON.stringify({
      name: "Useful Tool",
      url: "https://example.com/",
      email: "owner@example.com",
      category: "Developer Tools",
      description: "A useful browser tool that helps people complete a practical task with a simple and accessible interface.",
      ownership: true,
      rules: true,
      company: "",
      turnstileToken: "valid-token"
    })
  });

  const pending = [];
  const response = await onRequest({
    request,
    env: {
      DB,
      TURNSTILE_SECRET_KEY: "turnstile-secret",
      IP_HASH_SALT: "a-long-private-salt-value-for-tests",
      RATE_LIMIT_TIMEZONE: "Europe/London"
    },
    waitUntil(promise) { pending.push(promise); }
  });

  globalThis.fetch = originalFetch;
  await Promise.allSettled(pending);
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.slug, "example-com");
  assert.match(data.message, /now live/i);
  const insert = batches[1].find((statement) => /INSERT INTO sites/.test(statement.sql));
  assert.match(insert.sql, /'approved'/);
  assert.match(insert.sql, /approved_at/);
});
