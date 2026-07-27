import { onRequest as health } from "../functions/api/health.js";
import { onRequest as config } from "../functions/api/config.js";
import { onRequest as submit } from "../functions/api/submit.js";
import { onRequest as categories } from "../functions/api/categories.js";
import { onRequest as sites } from "../functions/api/sites/index.js";
import { onRequest as siteBySlug } from "../functions/api/sites/[slug].js";
import { onRequest as exactSite } from "../functions/api/site.js";
import { onRequest as favicon } from "../functions/api/favicon.js";
import { onRequest as contact } from "../functions/api/contact.js";
import { onRequest as report } from "../functions/api/report.js";
import { onRequest as adminStats } from "../functions/api/admin/stats.js";
import { onRequest as adminReports } from "../functions/api/admin/reports.js";
import { onRequest as adminContacts } from "../functions/api/admin/contacts/index.js";
import { onRequest as adminContactById } from "../functions/api/admin/contacts/[id].js";
import { onRequest as adminSubmissions } from "../functions/api/admin/submissions/index.js";
import { onRequest as adminSubmissionById } from "../functions/api/admin/submissions/[id].js";
import { onRequest as sitemap } from "../functions/sitemap.xml.js";
import { onRequest as feed } from "../functions/feed.xml.js";
import { onRequest as robots } from "../functions/robots.txt.js";

function pagesContext(request, env, ctx, params = {}) {
  return {
    request,
    env,
    params,
    waitUntil: (promise) => ctx.waitUntil(promise),
    passThroughOnException: () => {}
  };
}

function text(message, status = 404) {
  return new Response(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff"
    }
  });
}

async function routeDynamicRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const context = (params = {}) => pagesContext(request, env, ctx, params);

  if (path === "/api/health") return health(context());
  if (path === "/api/config") return config(context());
  if (path === "/api/submit") return submit(context());
  if (path === "/api/categories") return categories(context());
  if (path === "/api/sites") return sites(context());
  if (path === "/api/site") return exactSite(context());
  if (path === "/api/favicon") return favicon(context());
  if (path === "/api/contact") return contact(context());
  if (path === "/api/report") return report(context());
  if (path === "/api/admin/stats") return adminStats(context());
  if (path === "/api/admin/reports") return adminReports(context());
  if (path === "/api/admin/contacts") return adminContacts(context());
  if (path === "/api/admin/submissions") return adminSubmissions(context());

  const siteMatch = path.match(/^\/api\/sites\/([^/]+)$/);
  if (siteMatch) {
    return siteBySlug(context({ slug: decodeURIComponent(siteMatch[1]) }));
  }

  const adminContactMatch = path.match(/^\/api\/admin\/contacts\/(\d+)$/);
  if (adminContactMatch) {
    return adminContactById(context({ id: adminContactMatch[1] }));
  }

  const adminSubmissionMatch = path.match(/^\/api\/admin\/submissions\/(\d+)$/);
  if (adminSubmissionMatch) {
    return adminSubmissionById(context({ id: adminSubmissionMatch[1] }));
  }

  if (path === "/sitemap.xml") return sitemap(context());
  if (path === "/feed.xml") return feed(context());
  if (path === "/robots.txt") return robots(context());

  // Clean category URLs such as /category/travel use the category browser app.
  if (/^\/category\/[a-z0-9-]+\/?$/.test(path)) {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = "/categories.html";
    assetUrl.search = "";
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }

  // Clean contact URL should redirect once to the static contact page.
  // This avoids rewrite loops on some Cloudflare asset configurations.
  if (path === "/contact" || path === "/contact/") {
    const target = new URL(request.url);
    target.pathname = "/contact.html";
    return Response.redirect(target.toString(), 302);
  }

  // The public listing URL is /site/123-example-domain, but the browser app lives
  // in public/site.html and reads the slug from the current URL.
  if (/^\/site\/[^/]+\/?$/.test(path)) {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = "/site.html";
    assetUrl.search = "";
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }

  return null;
}

export default {
  async fetch(request, env, ctx) {
    try {
      const dynamicResponse = await routeDynamicRequest(request, env, ctx);
      if (dynamicResponse) return dynamicResponse;
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Unhandled Worker error", error);
      return text("Internal server error", 500);
    }
  }
};
