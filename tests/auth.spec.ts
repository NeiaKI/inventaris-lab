import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Clear storage before each test
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test("login page renders correctly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Inventaris Lab")).toBeVisible();
  await expect(page.getByText("SMK Bintang Nusantara")).toBeVisible();
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect(page.getByPlaceholder("Masukkan password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
});

test("login gagal tanpa memilih kelas", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Pilih nama kelas atau Admin terlebih dahulu")).toBeVisible();
});

test("login gagal dengan password salah", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: /Admin/ }).click();
  await page.getByPlaceholder("Masukkan password").fill("salah123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Username atau password salah")).toBeVisible();
});

test("login admin berhasil dan redirect ke dashboard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: /Admin/ }).click();
  await page.getByPlaceholder("Masukkan password").fill("admin123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/admin/dashboard");
  await expect(page.locator('main').getByText("Dashboard")).toBeVisible();
});

test("login kelas berhasil dan redirect ke pilih lab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "X RPL 1" }).click();
  await page.getByPlaceholder("Masukkan password").fill("kelas123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/kelas/labs");
  await expect(page.getByText("Pilih Laboratorium")).toBeVisible();
});

test("akses /admin/dashboard tanpa login redirect ke login", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL("/");
});

test("akses /kelas/labs tanpa login redirect ke login", async ({ page }) => {
  await page.goto("/kelas/labs");
  await expect(page).toHaveURL("/");
});

test("admin tidak bisa akses halaman kelas", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: /Admin/ }).click();
  await page.getByPlaceholder("Masukkan password").fill("admin123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.goto("/kelas/labs");
  await expect(page).toHaveURL("/");
});

test("logout dari admin kembali ke login", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: /Admin/ }).click();
  await page.getByPlaceholder("Masukkan password").fill("admin123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/admin/dashboard");
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL("/");
});
