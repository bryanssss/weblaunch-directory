import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/contact.js";

function mockDb() {
  const executed = [];
  return {
    executed,
    prepare(sql) {
      const statement = {
        sql,
        args: [],
        bind(...args) {
          return { ...statement, args, run: async () => ({ meta: { changes: 1 } }) };
        },
        run: async () => ({ meta: { changes: 0 } })
      };
      return statement;
    },
    async batch(statements) {
      executed.push(...statements);
      if (statements.some((item) => /SELECT count/.test(item.sql))) return [{ results: [] }, { results: [] }];
      return statements.map(() => ({ results: [], meta: { changes: 1 } }));
    }
  };
}

test("contact form stores a private D1 inbox message without an email binding", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("turnstile/v0/siteverify")) {
      return new Response(JSON.stringify({ success: true, action: "contact" }), { headers: { "content-type": "application/json" } });
    }
    throw new Error("Unexpected fetch");
  };

  const DB = mockDb();
  const request = new Request("https://directory.test/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.20" },
    body: JSON.stringify({
      name: "Helpful Visitor",
      email: "visitor@example.com",
      subject: "Problem with a listing",
      message: "The listing now redirects to a page that does not match its description.",
      listingId: "7",
      listingName: "Example Listing",
      listingDomain: "example.com",
      listingPath: "/site.html?domain=example.com",
      company: "",
      turnstileToken: "valid-token"
    })
  });

  const response = await onRequest({
    request,
    env: {
      DB,
      TURNSTILE_SECRET_KEY: "secret",
      IP_HASH_SALT: "a-long-private-salt-value-for-tests",
      RATE_LIMIT_TIMEZONE: "Europe/London"
    },
    waitUntil() {}
  });

  globalThis.fetch = originalFetch;
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.match(data.message, /private contact inbox/i);
  const insert = DB.executed.find((item) => /INSERT INTO contact_messages/.test(item.sql));
  assert.ok(insert);
  assert.equal(insert.args[0], "Helpful Visitor");
  assert.equal(insert.args[1], "visitor@example.com");
  assert.equal(insert.args[6], "example.com");
});
