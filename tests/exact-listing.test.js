import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/site.js";

const sample = {
  id: 7,
  name: "Free Online Dream Interpreter",
  slug: "somniascope-com",
  url: "https://somniascope.com/",
  normalized_domain: "somniascope.com",
  description: "A useful dream interpretation website.",
  category: "Productivity",
  featured: 0,
  approved_at: "2026-07-27T10:00:00.000Z"
};

function context(url, resolver) {
  return {
    request: new Request(url),
    env: {
      DB: {
        prepare(sql) {
          return {
            bind(...args) {
              return { async first() { return resolver(sql, args); } };
            }
          };
        }
      }
    }
  };
}

test("exact listing API resolves a published row by ID", async () => {
  const response = await onRequest(context("https://directory.test/api/site?id=7", (sql, args) => {
    if (/WHERE id =/.test(sql) && args[0] === 7) return sample;
    return null;
  }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.site.id, 7);
  assert.equal(data.canonicalPath, "/site.html?domain=somniascope.com");
});

test("exact listing API supports old slug keys", async () => {
  const response = await onRequest(context("https://directory.test/api/site?key=somniascope-com", (sql, args) => {
    if (/REPLACE\(LOWER\(normalized_domain\)/.test(sql) && args[0] === "somniascope-com") return sample;
    return null;
  }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).site.normalized_domain, "somniascope.com");
});
