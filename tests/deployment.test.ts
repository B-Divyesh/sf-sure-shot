import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type StaticWebAppConfig = {
  routes: Array<{ route: string; statusCode?: number; rewrite?: string }>;
  responseOverrides: Record<string, { rewrite?: string }>;
};

function readConfig(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as StaticWebAppConfig;
}

describe("static deployment contract", () => {
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
