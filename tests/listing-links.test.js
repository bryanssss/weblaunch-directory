import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/sites/[slug].js";

function responseContext(key, resolver) {
  return {
    request: new Request(`https://directory.test/api/sites/${key}`),
    params: { slug: key },
    env: {
      DB: {
        prepare(sql) {
          return {
            bind(...args) {
              return {
                async first() { return resolver(sql, args); }
              };
            }
          };
        }
      }
    }
  };
}

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

test("ID-prefixed listing links resolve by stable database ID", async () => {
  const response = await onRequest(responseContext("7-somniascope-com", (sql, args) => {
    if (/WHERE id =/.test(sql) && args[0] === 7) return sample;
    return null;
  }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.site.id, 7);
  assert.equal(data.canonicalPath, "/site.html?domain=somniascope.com");
});

test("legacy slug links fall back to the normalised domain slug", async () => {
  const response = await onRequest(responseContext("somniascope-com", (sql, args) => {
    if (/REPLACE\(LOWER\(normalized_domain\)/.test(sql) && args[0] === "somniascope-com") return sample;
    return null;
  }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.site.normalized_domain, "somniascope.com");
  assert.equal(data.canonicalPath, "/site.html?domain=somniascope.com");
});
