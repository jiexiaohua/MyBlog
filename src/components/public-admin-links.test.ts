import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const publicComponents = [
  "src/components/LandingExperience.tsx",
  "src/components/SiteHeader.tsx",
];

describe("public admin links", () => {
  it("does not expose the admin publishing route in public UI components", async () => {
    const files = await Promise.all(
      publicComponents.map(async (filePath) => ({
        filePath,
        contents: await readFile(path.join(process.cwd(), filePath), "utf8"),
      })),
    );

    expect(
      files.filter(({ contents }) => contents.includes('href="/admin"')),
    ).toEqual([]);
  });
});
