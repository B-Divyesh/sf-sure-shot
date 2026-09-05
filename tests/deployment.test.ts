import { existsSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

type StaticWebAppConfig = {
  routes: Array<{ route: string; statusCode?: number; rewrite?: string }>;
  responseOverrides: Record<string, { rewrite?: string }>;
};

function readConfig(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as StaticWebAppConfig;
}

describe("static deployment contract", () => {
  it("@claim:build-output runs the documented build and produces deployable files", () => {
    const started = Date.now();
    execFileSync("npm", ["run", "build"], { stdio: "pipe" });

    for (const file of [
      "dist/index.html",
      "dist/404.html",
      "dist/staticwebapp.config.json",
      "dist/robots.txt",
      "dist/sitemap.xml",
    ]) {
      expect(existsSync(file), `${file} exists after build`).toBe(true);
      expect(statSync(file).size, `${file} has content`).toBeGreaterThan(0);
      expect(statSync(file).mtimeMs, `${file} was written by this build`).toBeGreaterThanOrEqual(started - 2_000);
    }
    expect(readFileSync("dist/index.html", "utf8")).toContain("/assets/");
  });

  it("returns the designed page with a real 404 for direct /404 requests", () => {
    const source = readConfig("staticwebapp.config.json");
    const deployed = readConfig("public/staticwebapp.config.json");

    expect(deployed).toEqual(source);
    expect(deployed.routes.find((entry) => entry.route === "/404")).toEqual({
      route: "/404",
      statusCode: 404,
    });
    expect(deployed.responseOverrides["404"]).toEqual({ rewrite: "/404.html" });
    expect(readFileSync("public/sitemap.xml", "utf8")).not.toContain("/404</loc>");
  });
});
