import test from "node:test";
import assert from "node:assert/strict";
import { normalizeWebsiteUrl, slugFromDomain, validateSubmission, validateReport } from "../functions/_lib/validation.js";

test("accepts a clean HTTPS homepage", () => {
  assert.deepEqual(normalizeWebsiteUrl("https://www.example.com/"), {
    url: "https://www.example.com/",
    hostname: "www.example.com",
    normalisedDomain: "example.com"
  });
});

test("rejects HTTP", () => {
  assert.throws(() => normalizeWebsiteUrl("http://example.com/"), /Only secure/);
});

test("rejects deep links", () => {
  assert.throws(() => normalizeWebsiteUrl("https://example.com/product"), /main homepage/);
});

test("rejects affiliate and tracking query parameters", () => {
  assert.throws(() => normalizeWebsiteUrl("https://example.com/?ref=abc"), /Tracking, affiliate/);
});

test("rejects URL shorteners", () => {
  assert.throws(() => normalizeWebsiteUrl("https://bit.ly/"), /shorteners/);
});

test("rejects localhost and private IPs", () => {
  assert.throws(() => normalizeWebsiteUrl("https://localhost/"));
  assert.throws(() => normalizeWebsiteUrl("https://127.0.0.1/"));
  assert.throws(() => normalizeWebsiteUrl("https://192.168.1.5/"));
});

test("creates a stable slug from the domain", () => {
  assert.equal(slugFromDomain("my-useful-site.co.uk"), "my-useful-site-co-uk");
});

test("validates a complete submission", () => {
  const result = validateSubmission({
    name: "Example Tool",
    url: "https://example.com/",
    email: "owner@example.com",
    category: "Developer Tools",
    description: "A useful example tool that helps people complete a specific task with a clear and simple browser interface.",
    ownership: true,
    rules: true,
    company: ""
  });
  assert.equal(result.name, "Example Tool");
  assert.equal(result.website.normalisedDomain, "example.com");
});

test("validates reports and rejects unknown reasons", () => {
  assert.equal(validateReport({ siteId: 1, reason: "Broken website", details: "It no longer loads.", company: "" }).siteId, 1);
  assert.throws(() => validateReport({ siteId: 1, reason: "Made up reason", details: "", company: "" }), /valid report reason/);
});
