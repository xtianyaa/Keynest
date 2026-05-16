import { categories, demoEntries, filterEntries } from "./domain";

describe("domain data", () => {
  it("defines all MVP navigation categories", () => {
    expect(categories.map((category) => category.id)).toEqual([
      "all",
      "passwords",
      "api-keys",
      "secure-notes",
      "identity",
      "favorites",
      "trash",
      "settings"
    ]);
  });

  it("includes API key metadata for env line copying", () => {
    const apiKey = demoEntries.find((entry) => entry.type === "api-key");

    expect(apiKey).toMatchObject({
      type: "api-key",
      envVar: expect.any(String),
      project: expect.any(String),
      secret: expect.any(String)
    });
  });

  it("filters entries by category and query", () => {
    const result = filterEntries(demoEntries, "api-keys", "openai");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("OpenAI API Key");
  });

  it("keeps deleted entries out of all entries and exposes them in trash", () => {
    const deleted = {
      ...demoEntries[1],
      id: "deleted-gmail",
      deleted: true
    };

    expect(filterEntries([deleted], "all", "")).toHaveLength(0);
    expect(filterEntries([deleted], "trash", "")).toHaveLength(1);
  });
});
