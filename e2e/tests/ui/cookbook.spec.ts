import { expect, test, type Page } from "@playwright/test";
import { createChef, createRecipe, nameSortedFirst, uniqueName, validRecipe } from "../helpers";

const recipeList = (page: Page) => page.getByRole("list", { name: "Recipes" });
const recipeForm = (page: Page) => page.getByRole("form", { name: "Create recipe" });
const chefForm = (page: Page) => page.getByRole("form", { name: "Create chef" });

test("shows recipes with chef, cooking time and course", async ({ page, request }) => {
  const name = nameSortedFirst("shown");
  await createRecipe(request, validRecipe({ recipeName: name, cookingMinutes: 90, course: "MainCourse" }));

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Cookbook" })).toBeVisible();
  await expect(recipeList(page).getByRole("listitem").filter({ hasText: name }))
    .toHaveText(`${name} by alice · 90 min · Main course`);
});

test("shows 5 recipes per page and can page back and forth", async ({ page, request }) => {
  for (let i = 0; i < 6; i++) await createRecipe(request, validRecipe());
  await page.goto("/");

  const items = recipeList(page).getByRole("listitem");
  await expect(items).toHaveCount(5);
  await expect(page.getByText("Page 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  const firstPage = await items.allTextContents();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Page 2", { exact: true })).toBeVisible();
  await expect(items.first()).not.toHaveText(firstPage[0]!);
  const secondPage = await items.allTextContents();
  expect(secondPage.length).toBeGreaterThan(0);
  expect(secondPage.filter(t => firstPage.includes(t))).toEqual([]);

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByText("Page 1", { exact: true })).toBeVisible();
  await expect(items).toHaveText(firstPage);
});

test("creates a recipe through the form", async ({ page }) => {
  const name = nameSortedFirst("created in UI");
  await page.goto("/");

  const form = recipeForm(page);
  await form.getByLabel("Name").fill(name);
  await form.getByLabel("Minutes").fill("15");
  await form.getByLabel("Chef").selectOption({ label: "alice" });
  await form.getByLabel("Course").selectOption({ label: "Starter" });
  await form.getByRole("button", { name: "Create recipe" }).click();

  await expect(recipeList(page).getByRole("listitem").filter({ hasText: name }))
    .toHaveText(`${name} by alice · 15 min · Starter`);
});

test("shows the server's error message when a name is too long", async ({ page }) => {
  await page.goto("/");

  const form = recipeForm(page);
  await form.getByLabel("Name").fill("x".repeat(101));
  await form.getByRole("button", { name: "Create recipe" }).click();

  await expect(page.getByText("Name must be at most 100 characters")).toBeVisible();
});

test("a new chef can be picked when creating a recipe", async ({ page }) => {
  const chefName = uniqueName("chef");
  const name = nameSortedFirst("by new chef");
  await page.goto("/");

  await chefForm(page).getByLabel("Chef name").fill(chefName);
  await chefForm(page).getByRole("button", { name: "Create chef" }).click();

  const form = recipeForm(page);
  const chefSelect = form.getByLabel("Chef");
  await expect(chefSelect.getByRole("option", { name: chefName })).toBeAttached();
  await form.getByLabel("Name").fill(name);
  await chefSelect.selectOption({ label: chefName });
  await form.getByRole("button", { name: "Create recipe" }).click();

  await expect(recipeList(page).getByRole("listitem").filter({ hasText: name }))
    .toHaveText(`${name} by ${chefName} · 30 min · Main course`);
});

test("recipes created by someone else show up after a reload", async ({ page, request }) => {
  const chef = await (await createChef(request, uniqueName("api chef"))).json();
  const name = nameSortedFirst("from api");
  await page.goto("/");
  await createRecipe(request, validRecipe({ recipeName: name, chefId: chef.chefId, course: "Drink" }));

  await page.reload();

  await expect(recipeList(page).getByRole("listitem").filter({ hasText: name }))
    .toHaveText(`${name} by ${chef.chefName} · 45 min · Drink`);
});
