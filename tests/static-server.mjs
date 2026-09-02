import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

const root = resolve("dist");
const csp =
  "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url ?? "/", "http://127.0.0.1").pathname,
  );
  const requested = resolve(root, `.${pathname}`);
  const isSafeFile =
    requested.startsWith(`${root}/`) &&
    existsSync(requested) &&
    statSync(requested).isFile();
  const file = isSafeFile ? requested : resolve(root, "index.html");
  const status = pathname.startsWith("/assets/") && !isSafeFile ? 404 : 200;
  response.writeHead(status, {
    "Content-Type": types[extname(file)] ?? "application/octet-stream",
    "Content-Security-Policy": csp,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(status === 404 ? "Not found" : readFileSync(file));
}).listen(4173, "127.0.0.1");
