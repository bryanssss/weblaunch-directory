import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

function ctx() {
  return { waitUntil() {} };
}

test("Worker routes the health endpoint to backend code", async () => {
  const request = new Request("https://example.test/api/health");
  const env = {
    DB: {},
    TURNSTILE_SITE_KEY: "site-key",
    TURNSTILE_SECRET_KEY: "secret-key",
    ADMIN_KEY: "a".repeat(24),
    IP_HASH_SALT: "b".repeat(24),
    ASSETS: { fetch: async () => new Response("asset") }
  };
  const response = await worker.fetch(request, env, ctx());
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.ready, true);
});

test("Worker rewrites clean listing URLs to site.html", async () => {
  let requestedPath = "";
  const env = {
    ASSETS: {
      fetch: async (request) => {
        requestedPath = new URL(request.url).pathname;
        return new Response("listing app");
      }
    }
  };
  const response = await worker.fetch(new Request("https://example.test/site/example-com"), env, ctx());
  assert.equal(response.status, 200);
  assert.equal(requestedPath, "/site.html");
});

test("Worker passes normal pages to static assets", async () => {
  let requestedPath = "";
  const env = {
    ASSETS: {
      fetch: async (request) => {
        requestedPath = new URL(request.url).pathname;
        return new Response("static page");
      }
    }
  };
  const response = await worker.fetch(new Request("https://example.test/submit"), env, ctx());
  assert.equal(response.status, 200);
  assert.equal(requestedPath, "/submit");
});
