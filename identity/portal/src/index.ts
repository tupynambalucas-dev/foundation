export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Clean URL rewrites for root and subpages
    if (url.pathname === "/privacy") {
      url.pathname = "/privacy.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    if (url.pathname === "/terms") {
      url.pathname = "/terms.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    if (url.pathname === "/rclone" || url.pathname === "/rclone/") {
      url.pathname = "/rclone/index.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    if (url.pathname === "/workspace" || url.pathname === "/workspace/") {
      url.pathname = "/workspace/index.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // Fetch the asset from Cloudflare Workers edge static storage
    const response = await env.ASSETS.fetch(request);

    // Apply enterprise security headers on all responses
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("X-Frame-Options", "DENY");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    newHeaders.set("Permissions-Policy", "interest-cohort=()");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
