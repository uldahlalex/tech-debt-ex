import { expect, test } from "@playwright/test";
import {
  type Chef,
  type Recipe,
  SEEDED_CHEF,
  createChef,
  createRecipe,
  expectValidationError,
  getAllRecipes,
  getRecipes,
  uniqueName,
  validRecipe,
} from "../helpers";

test.describe("GET /GetRecipes", () => {
  test("contains the seeded recipe with its chef", async ({ request }) => {
    const recipes = await getAllRecipes(request);
    const seeded = recipes.find(r => r.recipeId === "1");
    expect(seeded).toEqual({
      recipeId: "1",
      recipeName: "pancakes",
      cookingMinutes: 20,
      course: "Dessert",
      chefId: SEEDED_CHEF.chefId,
      chef: SEEDED_CHEF,
    });
  });

  test("returns at most resultsPerPage recipes", async ({ request }) => {
    for (let i = 0; i < 3; i++) await createRecipe(request, validRecipe());

    const response = await getRecipes(request, 1, 2);
    expect(response.status()).toBe(200);
    const recipes: Recipe[] = await response.json();
    expect(recipes).toHaveLength(2);
  });

  test("pages do not overlap and together contain every recipe", async ({ request }) => {
    for (let i = 0; i < 5; i++) await createRecipe(request, validRecipe());
    const everything = await getAllRecipes(request);

    const seen: string[] = [];
    for (let page = 1; ; page++) {
      const recipes: Recipe[] = await (await getRecipes(request, page, 3)).json();
      seen.push(...recipes.map(r => r.recipeId));
      if (recipes.length < 3) break;
    }

    expect(new Set(seen).size).toBe(seen.length);
    expect(seen.sort()).toEqual(everything.map(r => r.recipeId).sort());
  });

  test("recipes are sorted alphabetically by name", async ({ request }) => {
    const names = (await getAllRecipes(request)).map(r => r.recipeName);
    const sorted = [...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    expect(names).toEqual(sorted);
  });

  test("a page after the last one is empty", async ({ request }) => {
    const response = await getRecipes(request, 10_000, 50);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  for (const [page, resultsPerPage] of [[0, 10], [-1, 10], [1, 0], [1, 51]]) {
    test(`rejects page=${page} resultsPerPage=${resultsPerPage}`, async ({ request }) => {
      await expectValidationError(await getRecipes(request, page!, resultsPerPage!));
    });
  }

  test("accepts the largest allowed page size (50)", async ({ request }) => {
    expect((await getRecipes(request, 1, 50)).status()).toBe(200);
  });
});

test.describe("POST /CreateRecipe", () => {
  test("creates a recipe and returns it with its chef", async ({ request }) => {
    const chef: Chef = await (await createChef(request, uniqueName("chef"))).json();
    const body = validRecipe({ chefId: chef.chefId, course: "Starter", cookingMinutes: 12 });

    const response = await createRecipe(request, body);

    expect(response.status()).toBe(200);
    const recipe: Recipe = await response.json();
    expect(recipe).toEqual({
      recipeId: expect.any(String),
      recipeName: body.recipeName,
      cookingMinutes: 12,
      course: "Starter",
      chefId: chef.chefId,
      chef,
    });
    expect(recipe.recipeId.length).toBeGreaterThan(0);
  });

  test("the created recipe can be fetched afterwards", async ({ request }) => {
    const created: Recipe = await (await createRecipe(request, validRecipe({ course: "Drink" }))).json();
    const found = (await getAllRecipes(request)).find(r => r.recipeId === created.recipeId);
    expect(found).toEqual(created);
  });

  test("every course can be used", async ({ request }) => {
    for (const course of ["Starter", "MainCourse", "Dessert", "Drink"]) {
      const response = await createRecipe(request, validRecipe({ course }));
      expect(response.status(), course).toBe(200);
      expect((await response.json()).course).toBe(course);
    }
  });

  test("each recipe gets its own id", async ({ request }) => {
    const a: Recipe = await (await createRecipe(request, validRecipe())).json();
    const b: Recipe = await (await createRecipe(request, validRecipe())).json();
    expect(a.recipeId).not.toBe(b.recipeId);
  });

  test("trims whitespace around the name", async ({ request }) => {
    const name = uniqueName("trimmed");
    const recipe: Recipe = await (await createRecipe(request, validRecipe({ recipeName: `   ${name}  ` }))).json();
    expect(recipe.recipeName).toBe(name);
  });

  test("accepts a name of exactly 100 characters", async ({ request }) => {
    const response = await createRecipe(request, validRecipe({ recipeName: "a".repeat(100) }));
    expect(response.status()).toBe(200);
  });

  test("accepts the cooking time limits 1 and 1440 minutes", async ({ request }) => {
    expect((await createRecipe(request, validRecipe({ cookingMinutes: 1 }))).status()).toBe(200);
    expect((await createRecipe(request, validRecipe({ cookingMinutes: 1440 }))).status()).toBe(200);
  });

  const invalidRecipes: [string, Record<string, unknown>][] = [
    ["an empty name", { recipeName: "" }],
    ["a name of only spaces", { recipeName: "    " }],
    ["a missing name", { recipeName: undefined }],
    ["a name longer than 100 characters", { recipeName: "a".repeat(101) }],
    ["0 minutes", { cookingMinutes: 0 }],
    ["negative minutes", { cookingMinutes: -5 }],
    ["more than 1440 minutes", { cookingMinutes: 1441 }],
    ["minutes that are not a number", { cookingMinutes: "a while" }],
    ["a chef that does not exist", { chefId: "no-such-chef" }],
    ["an unknown course", { course: "Snack" }],
  ];
  for (const [description, overrides] of invalidRecipes) {
    test(`rejects ${description}`, async ({ request }) => {
      const body = validRecipe(overrides);
      await expectValidationError(await createRecipe(request, body));

      const stored = (await getAllRecipes(request)).filter(r => r.recipeName === body.recipeName);
      expect(stored).toEqual([]);
    });
  }

  test("the error message explains the name limit", async ({ request }) => {
    const problem = await expectValidationError(
      await createRecipe(request, validRecipe({ recipeName: "a".repeat(101) })),
    );
    expect(problem.title).toContain("100");
  });
});
