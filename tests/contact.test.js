import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/contact.js";

test("contact form sends a private email through the binding", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("turnstile/v0/siteverify")) {
      return new Response(JSON.stringify({ success: true, action: "contact" }), { headers: { "content-type": "application/json" } });
    }
    throw new Error("Unexpected fetch");
  };

  const sent = [];
  const DB = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            sql,
            args,
            run: async () => ({ meta: { changes: 0 } })
          };
        },
        run: async () => ({ meta: { changes: 0 } })
      };
    },
    async batch(statements) {
      if (statements.some((item) => /SELECT count/.test(item.sql))) return [{ results: [] }, { results: [] }];
      return statements.map(() => ({ results: [], meta: { changes: 1 } }));
    }
  };

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
      listingPath: "/site/7-example-com",
      company: "",
      turnstileToken: "valid-token"
    })
  });

  const response = await onRequest({
    request,
    env: {
      DB,
      CONTACT_EMAIL: { async send(message) { sent.push(message); return { messageId: "test-id" }; } },
      CONTACT_TO_EMAIL: "private-owner@example.com",
      CONTACT_FROM_EMAIL: "directory@example.org",
      CONTACT_FROM_NAME: "WebLaunch Directory",
      TURNSTILE_SECRET_KEY: "secret",
      IP_HASH_SALT: "a-long-private-salt-value-for-tests",
      RATE_LIMIT_TIMEZONE: "Europe/London"
    },
    waitUntil() {}
  });

  globalThis.fetch = originalFetch;
  assert.equal(response.status, 201);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "private-owner@example.com");
  assert.equal(sent[0].replyTo.email, "visitor@example.com");
  assert.match(sent[0].subject, /example\.com/);
});
