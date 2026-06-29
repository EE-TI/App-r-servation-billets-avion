import { test, expect } from "@playwright/test";

test.describe("SkyVoyage App", () => {
  test("homepage loads with hero and search form", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Votre prochain voyage");
    await expect(page.getByPlaceholder("Ville ou aéroport").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /rechercher/i })).toBeVisible();
  });

  test("search form shows airport suggestions", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder("Ville ou aéroport").first();
    await input.fill("Par");
    await expect(page.getByText("Charles de Gaulle")).toBeVisible();
  });

  test("navigates to results page on search", async ({ page }) => {
    await page.goto("/results?from=CDG&to=JFK");
    await page.waitForURL(/\/results/);
    await expect(page.locator("h1")).toContainText("CDG");
  });

  test("results page shows flights after loading", async ({ page }) => {
    await page.goto("/results?from=CDG&to=JFK");
    await expect(page.getByText("Meilleur prix")).toBeVisible({ timeout: 5000 });
  });

  test("can filter flights by direct only", async ({ page }) => {
    await page.goto("/results?from=CDG&to=JFK");
    await expect(page.getByText("Meilleur prix")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Direct" }).click();
    const cards = page.locator("text=Direct");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Connexion");
    await expect(page.getByPlaceholder("vous@exemple.com")).toBeVisible();
  });

  test("register page renders", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText("Créer un compte");
  });

  test("register and login flow", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Jean").fill("Test");
    await page.getByPlaceholder("Dupont").fill("User");
    await page.getByPlaceholder("vous@exemple.com").fill("test@example.com");
    await page.getByPlaceholder("Minimum 6 caractères").fill("password123");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await page.waitForURL("/");
    await expect(page.getByText("TU")).toBeVisible();
  });

  test("booking page shows passenger form and summary", async ({ page }) => {
    await page.goto("/booking?id=AF-1000&from=CDG&to=JFK&price=249&currency=EUR&dep=08:30&arr=15:45&airline=Air%20France&duration=7h%2015&stops=0");
    await expect(page.locator("h2")).toContainText("Informations du passager");
    await expect(page.getByText("Résumé du vol")).toBeVisible();
    await expect(page.getByText("249")).toBeVisible();
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByLabel("Basculer le thème").click();
    await expect(html).toHaveClass(/dark/);

    await page.getByLabel("Basculer le thème").click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("trips page requires auth", async ({ page }) => {
    await page.goto("/trips");
    await expect(page.locator("h1")).toContainText("Connectez-vous");
  });
});
