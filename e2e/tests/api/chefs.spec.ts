import { expect, test } from "@playwright/test";
import { type Chef, SEEDED_CHEF, createChef, expectValidationError, getChefs, uniqueName } from "../helpers";

test.describe("GET /GetChefs", () => {
  test("contains the seeded chef", async ({ request }) => {
    expect(await getChefs(request)).toContainEqual(SEEDED_CHEF);
  });

  test("chefs are sorted alphabetically by name", async ({ request }) => {
    await createChef(request, "zzz last");
    await createChef(request, "AAA first");
    const names = (await getChefs(request)).map(c => c.chefName);
    const sorted = [...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    expect(names).toEqual(sorted);
  });
});

test.describe("POST /CreateChef", () => {
  test("creates a chef that is then listed", async ({ request }) => {
    const name = uniqueName("chef");
    const response = await createChef(request, name);

    expect(response.status()).toBe(200);
    const chef: Chef = await response.json();
    expect(chef).toEqual({ chefId: expect.any(String), chefName: name });
    expect(await getChefs(request)).toContainEqual(chef);
  });

  test("each chef gets their own id", async ({ request }) => {
    const a: Chef = await (await createChef(request, uniqueName("a"))).json();
    const b: Chef = await (await createChef(request, uniqueName("b"))).json();
    expect(a.chefId).not.toBe(b.chefId);
  });

  test("trims whitespace around the name", async ({ request }) => {
    const name = uniqueName("trimmed");
    const chef: Chef = await (await createChef(request, `  ${name} `)).json();
    expect(chef.chefName).toBe(name);
  });

  test("accepts a name of exactly 60 characters", async ({ request }) => {
    expect((await createChef(request, "n".repeat(60))).status()).toBe(200);
  });

  for (const [description, name] of [
    ["an empty name", ""],
    ["a name of only spaces", "   "],
    ["a missing name", undefined],
    ["a name longer than 60 characters", "n".repeat(61)],
  ] as const) {
    test(`rejects ${description}`, async ({ request }) => {
      const before = (await getChefs(request)).length;
      await expectValidationError(await createChef(request, name));
      expect((await getChefs(request)).length).toBe(before);
    });
  }
});
