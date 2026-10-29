import { expect, type APIRequestContext } from "@playwright/test";

export const API_URL = "http://localhost:5150";

/** The JSON shapes the API promises to return. Refactoring must not change these. */
export type Chef = { chefId: string; chefName: string };
export type Recipe = {
  recipeId: string;
  recipeName: string;
  cookingMinutes: number;
  course: "Starter" | "MainCourse" | "Dessert" | "Drink";
  chefId: string;
  chef: Chef;
};
export type Problem = { title: string; status?: number };

/** The chef that the server always creates in an empty database. */
export const SEEDED_CHEF: Chef = { chefId: "1", chefName: "alice" };

let counter = 0;
/** A name nobody else has used, so tests don't interfere with each other. */
export function uniqueName(label: string): string {
  return `E2E ${label} ${Date.now()}-${counter++}`;
}

/**
 * Recipes are listed alphabetically. Names from this helper start with "!" and a
 * number that gets SMALLER over time, so the newest recipe is always first in the list.
 */
export function nameSortedFirst(label: string): string {
  const descending = (9_999_999_999_999 - Date.now()).toString().padStart(13, "0");
  return `!${descending}-${counter++} ${label}`;
}

export async function getRecipes(request: APIRequestContext, page: number, resultsPerPage: number) {
  return request.get(`${API_URL}/GetRecipes`, { params: { page, resultsPerPage } });
}

export async function getAllRecipes(request: APIRequestContext): Promise<Recipe[]> {
  const all: Recipe[] = [];
  for (let page = 1; ; page++) {
    const response = await getRecipes(request, page, 50);
    expect(response.status()).toBe(200);
    const recipes: Recipe[] = await response.json();
    all.push(...recipes);
    if (recipes.length < 50) return all;
  }
}

export async function getChefs(request: APIRequestContext): Promise<Chef[]> {
  const response = await request.get(`${API_URL}/GetChefs`);
  expect(response.status()).toBe(200);
  return response.json();
}

export async function createRecipe(
  request: APIRequestContext,
  body: Partial<Record<keyof Omit<Recipe, "recipeId" | "chef">, unknown>>,
) {
  return request.post(`${API_URL}/CreateRecipe`, { data: body });
}

export async function createChef(request: APIRequestContext, chefName: unknown) {
  return request.post(`${API_URL}/CreateChef`, { data: { chefName } });
}

export function validRecipe(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    recipeName: uniqueName("recipe"),
    cookingMinutes: 45,
    chefId: SEEDED_CHEF.chefId,
    course: "MainCourse",
    ...overrides,
  };
}

/** Every rejected request must be a 400 with a human readable `title`. */
export async function expectValidationError(response: Awaited<ReturnType<APIRequestContext["post"]>>) {
  expect(response.status(), await response.text()).toBe(400);
  const problem = (await response.json()) as Problem;
  expect(typeof problem.title).toBe("string");
  expect(problem.title.length).toBeGreaterThan(0);
  return problem;
}
