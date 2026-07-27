import test from "node:test";
import assert from "node:assert/strict";
import { onRequest as listContacts } from "../functions/api/admin/contacts/index.js";
import { onRequest as changeContact } from "../functions/api/admin/contacts/[id].js";

const ADMIN_KEY = "a".repeat(32);

function request(url, options = {}) {
  return new Request(url, { ...options, headers: { authorization: `Bearer ${ADMIN_KEY}`, "content-type": "application/json", ...(options.headers || {}) } });
}

function dbForList() {
  return {
    prepare(sql) {
      const base = { sql, args: [], bind(...args) { return { ...base, args, run: async () => ({ meta: { changes: 1 } }) }; }, run: async () => ({ meta: { changes: 0 } }) };
      return base;
    },
    async batch(statements) {
      if (/SELECT id, name, reply_email/.test(statements[0].sql)) {
        return [
          { results: [{ id: 1, name: "Visitor", reply_email: "visitor@example.com", subject: "Hello", message: "A useful private message with enough text.", status: "open", listing_name: "", listing_domain: "", listing_path: "", created_at: "2026-07-27T12:00:00.000Z" }] },
          { results: [{ total: 1 }] }
        ];
      }
      return statements.map(() => ({ results: [] }));
    }
  };
}

test("administrator can list private contact inbox messages", async () => {
  const response = await listContacts({ request: request("https://directory.test/api/admin/contacts?status=open"), env: { DB: dbForList(), ADMIN_KEY } });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.messages.length, 1);
  assert.equal(data.messages[0].reply_email, "visitor@example.com");
});

test("administrator can resolve a contact message", async () => {
  let updated = false;
  const DB = {
    prepare(sql) {
      return {
        run: async () => ({ meta: { changes: 0 } }),
        bind() {
          return { run: async () => { if (/UPDATE contact_messages/.test(sql)) updated = true; return { meta: { changes: 1 } }; } };
        }
      };
    }
  };
  const response = await changeContact({
    request: request("https://directory.test/api/admin/contacts/1", { method: "PATCH", body: JSON.stringify({ action: "resolve" }) }),
    env: { DB, ADMIN_KEY },
    params: { id: "1" }
  });
  assert.equal(response.status, 200);
  assert.equal(updated, true);
});
