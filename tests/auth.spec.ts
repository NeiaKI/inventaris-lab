import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");
  await page.evaluate(() => sessionStorage.clear());
});

async function loginAdmin(page: Page) {
  await page.context().clearCookies();
  await page.goto("/admin");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Masuk sebagai Admin" }).click();
  await expect(page).toHaveURL("/admin/dashboard", { timeout: 15000 });
}

async function loginKelas(page: Page) {
  await page.context().clearCookies();
  await page.goto("/");
  // Wait for Supabase to load class list
  await expect(page.getByRole("combobox")).toBeEnabled({ timeout: 8000 });
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "X RPL 1" }).click();
  await page.getByPlaceholder("Masukkan password").fill("kelas123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/kelas/labs", { timeout: 15000 });
}

test("login page renders correctly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Inventaris Lab")).toBeVisible();
  await expect(page.getByText("SMK Bintang Nusantara")).toBeVisible();
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect(page.getByPlaceholder("Masukkan password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
});

test("admin login page renders correctly", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByText("Portal Admin")).toBeVisible();
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Masuk sebagai Admin" })).toBeVisible();
});

test("login gagal tanpa memilih kelas", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Pilih nama kelas terlebih dahulu")).toBeVisible();
});

test("login admin gagal dengan password salah", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("salah123");
  await page.getByRole("button", { name: "Masuk sebagai Admin" }).click();
  await expect(page.getByText("Username atau password salah")).toBeVisible({ timeout: 10000 });
});

test("login admin berhasil dan redirect ke dashboard", async ({ page }) => {
  await loginAdmin(page);
  await expect(page.locator("main").getByText("Dashboard")).toBeVisible();
});

test("login kelas berhasil dan redirect ke pilih lab", async ({ page }) => {
  await loginKelas(page);
  await expect(page.getByText("Pilih Laboratorium")).toBeVisible();
});

test("akses /admin/dashboard tanpa login redirect ke admin login", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL("/admin", { timeout: 8000 });
});

test("akses /kelas/labs tanpa login redirect ke login", async ({ page }) => {
  await page.goto("/kelas/labs");
  await expect(page).toHaveURL("/", { timeout: 8000 });
});

test("admin tidak bisa akses halaman kelas", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/kelas/labs");
  await expect(page).toHaveURL("/", { timeout: 8000 });
});

test("logout dari admin kembali ke login", async ({ page }) => {
  await loginAdmin(page);
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL("/", { timeout: 8000 });
});
