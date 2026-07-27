import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/sites/index.js";

function makeContext(url) {
  const statements = [];
  const DB = {
    prepare(sql) {
      return {
        bind(...args) {
          const statement = { sql, args };
          statements.push(statement);
          return statement;
        }
      };
    },
    async batch() {
      return [
        { results: [{ id: 7, normalized_domain: "somniascope.com", slug: "somniascope-com", status: "approved" }] },
        { results: [{ total: 1 }] }
      ];
    }
  };
  return { request: new Request(url), env: { DB }, statements };
}

test("list API supports an exact domain lookup used by listing pages", async () => {
  const context = makeContext("https://directory.test/api/sites?domain=www.somniascope.com&limit=1");
  const response = await onRequest(context);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.sites[0].normalized_domain, "somniascope.com");
  assert.match(context.statements[0].sql, /LOWER\(normalized_domain\) = \?/);
  assert.equal(context.statements[0].args[0], "somniascope.com");
});

test("list API supports an exact numeric ID lookup", async () => {
  const context = makeContext("https://directory.test/api/sites?id=7&limit=1");
  const response = await onRequest(context);
  assert.equal(response.status, 200);
  assert.match(context.statements[0].sql, /id = \?/);
  assert.equal(context.statements[0].args[0], 7);
});

test("directory search matches every word across name, description, domain, category and URL", async () => {
  const context = makeContext("https://directory.test/api/sites?q=dream%20interpreter%20somniascope&limit=12");
  const response = await onRequest(context);
  assert.equal(response.status, 200);
  const sql = context.statements[0].sql;
  assert.match(sql, /LOWER\(name\) LIKE/);
  assert.match(sql, /LOWER\(description\) LIKE/);
  assert.match(sql, /LOWER\(normalized_domain\) LIKE/);
  assert.match(sql, /LOWER\(category\) LIKE/);
  assert.match(sql, /LOWER\(url\) LIKE/);
  assert.ok(context.statements[0].args.includes("%dream%"));
  assert.ok(context.statements[0].args.includes("%interpreter%"));
  assert.ok(context.statements[0].args.includes("%somniascope%"));
});
