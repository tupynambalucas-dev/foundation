export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Cloudflare Workers Static Assets automatically resolves clean URLs,
    // directory index files (e.g. /rclone -> /rclone/index.html), and 404-page handling.
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
