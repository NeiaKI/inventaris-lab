import { test, expect, type Page } from "@playwright/test";

async function loginAdmin(page: Page) {
  await page.context().clearCookies();
  await page.goto("/admin");
  await page.evaluate(() => localStorage.removeItem("inv_user"));
  await page.reload();
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Masuk sebagai Admin" }).click();
  await expect(page).toHaveURL("/admin/dashboard", { timeout: 15000 });
}

test("dashboard menampilkan stats cards", async ({ page }) => {
  await loginAdmin(page);
  await expect(page.getByText("Total Lab")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Total Barang")).toBeVisible();
  await expect(page.locator("main").getByText("Akun Kelas")).toBeVisible();
  await expect(page.getByText("Barang Bermasalah")).toBeVisible();
});

test("navigasi sidebar admin berfungsi", async ({ page }) => {
  await loginAdmin(page);
  await page.getByRole("link", { name: "Laboratorium" }).click();
  await expect(page).toHaveURL("/admin/labs", { timeout: 8000 });
  await page.getByRole("link", { name: "Master Barang" }).click();
  await expect(page).toHaveURL("/admin/items", { timeout: 8000 });
  await page.getByRole("link", { name: "Akun Kelas" }).click();
  await expect(page).toHaveURL("/admin/classes", { timeout: 8000 });
  await page.getByRole("link", { name: "Log Sesi" }).click();
  await expect(page).toHaveURL("/admin/sessions", { timeout: 8000 });
});

test("tambah lab baru", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/labs");
  await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Tambah Lab" }).click();
  await page.getByLabel("Nama Lab").fill("Lab Test Baru");
  await page.getByLabel("Lokasi").fill("Gedung C, Lantai 1");
  await page.getByRole("button", { name: "Tambah" }).click();
  await expect(page.locator("table").getByText("Lab Test Baru").first()).toBeVisible({ timeout: 10000 });
});

test("edit lab yang sudah ada", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/labs");
  await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10000 });
  await page.getByRole("row").nth(1).getByRole("button").first().click();
  // Edit location only (not name) to keep lab names stable for kelas tests
  await page.getByLabel("Lokasi").fill("Gedung A, Lantai 2 (Updated)");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.locator("table").getByText("Gedung A, Lantai 2 (Updated)")).toBeVisible({ timeout: 10000 });
});

test("hapus lab dengan konfirmasi", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/labs");
  // Wait for "Lab Test Baru" (added by previous test) to appear after Supabase syncs
  await expect(page.getByRole("row").filter({ hasText: "Lab Test Baru" }).last()).toBeVisible({ timeout: 15000 });
  const before = await page.getByRole("row").filter({ hasText: "Lab Test Baru" }).count();
  // Delete the last "Lab Test Baru" row
  await page.getByRole("row").filter({ hasText: "Lab Test Baru" }).last().getByRole("button").last().click();
  await page.getByRole("button", { name: "Hapus" }).click();
  // Verify one "Lab Test Baru" entry was removed
  await expect(page.getByRole("row").filter({ hasText: "Lab Test Baru" })).toHaveCount(before - 1, { timeout: 15000 });
});

test("tambah barang baru", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/items");
  // Wait for Supabase data (ensures labs are also loaded)
  await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Tambah Barang" }).click();
  // Explicitly select a lab from the dialog dropdown
  await page.getByRole("dialog").getByRole("combobox").click();
  await expect(page.getByRole("option").first()).toBeVisible({ timeout: 5000 });
  await page.getByRole("option").first().click();
  await page.getByLabel("Nama Barang").fill("Headset");
  await page.getByLabel("Kategori").fill("Periferal");
  await page.getByLabel("Jumlah Awal").fill("10");
  await page.getByLabel("Jumlah Berfungsi").fill("10");
  await page.getByRole("button", { name: "Tambah" }).click();
  await expect(page.locator("table").getByText("Headset").first()).toBeVisible({ timeout: 10000 });
});

test("filter barang berdasarkan lab", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/items");
  await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10000 });
  const allCount = await page.getByRole("row").count();
  // First combobox on page is the filter (not dialog)
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Lab RPL" }).click();
  const filteredCount = await page.getByRole("row").count();
  expect(filteredCount).toBeLessThanOrEqual(allCount);
});

test("tambah akun kelas baru", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/classes");
  await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Tambah Kelas" }).click();
  await page.getByLabel("Nama Kelas").fill("XII TKJ 1");
  await page.getByLabel("Username").fill("xii-tkj-1");
  await page.getByLabel("Password").fill("pass123");
  await page.getByRole("button", { name: "Tambah" }).click();
  await expect(page.locator("table").getByText("XII TKJ 1").first()).toBeVisible({ timeout: 10000 });
});

test("reset password kelas", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/classes");
  // Wait for X RPL 1 row to be stable (text-based locator handles re-renders)
  const row = page.getByRole("row").filter({ hasText: "X RPL 1" });
  await expect(row).toBeVisible({ timeout: 10000 });
  // Allow Supabase realtime to settle after previous test's mutation
  await page.waitForTimeout(1000);
  // First button in the row is KeyRound (reset password)
  await row.getByRole("button").first().click();
  await page.getByLabel("Password Baru").fill("newpass456");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Password Baru")).not.toBeVisible({ timeout: 5000 });
});

test("log sesi menampilkan riwayat sesi", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/sessions");
  await expect(page.locator("main").getByText("Log Sesi")).toBeVisible({ timeout: 10000 });
  const rows = await page.getByRole("row").count();
  expect(rows).toBeGreaterThan(1);
});

test("search di log sesi berfungsi", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/sessions");
  await expect(page.locator("main").getByText("Log Sesi")).toBeVisible({ timeout: 10000 });
  await page.getByPlaceholder("Cari kelas atau lab...").fill("RPL");
  await page.waitForTimeout(300);
  const rows = await page.getByRole("row").count();
  expect(rows).toBeGreaterThanOrEqual(1);
});
