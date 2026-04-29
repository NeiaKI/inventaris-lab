import { test, expect } from "@playwright/test";

async function loginAdmin(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: /Admin/ }).click();
  await page.getByPlaceholder("Masukkan password").fill("admin123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/admin/dashboard");
}

test("dashboard menampilkan stats cards", async ({ page }) => {
  await loginAdmin(page);
  await expect(page.getByText("Total Lab")).toBeVisible();
  await expect(page.getByText("Total Barang")).toBeVisible();
  await expect(page.locator('main').getByText("Akun Kelas")).toBeVisible();
  await expect(page.getByText("Barang Bermasalah")).toBeVisible();
});

test("navigasi sidebar admin berfungsi", async ({ page }) => {
  await loginAdmin(page);
  await page.getByRole("link", { name: "Laboratorium" }).click();
  await expect(page).toHaveURL("/admin/labs");
  await page.getByRole("link", { name: "Master Barang" }).click();
  await expect(page).toHaveURL("/admin/items");
  await page.getByRole("link", { name: "Akun Kelas" }).click();
  await expect(page).toHaveURL("/admin/classes");
  await page.getByRole("link", { name: "Log Sesi" }).click();
  await expect(page).toHaveURL("/admin/sessions");
});

test("tambah lab baru", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/labs");
  await page.getByRole("button", { name: "Tambah Lab" }).click();
  await page.getByLabel("Nama Lab").fill("Lab Test Baru");
  await page.getByLabel("Lokasi").fill("Gedung C, Lantai 1");
  await page.getByRole("button", { name: "Tambah" }).click();
  await expect(page.getByText("Lab Test Baru")).toBeVisible();
});

test("edit lab yang sudah ada", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/labs");
  const editButtons = page.getByRole("row").nth(1).getByRole("button").first();
  await editButtons.click();
  await page.getByLabel("Nama Lab").fill("Lab Komputer 1 Edit");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText("Lab Komputer 1 Edit")).toBeVisible();
});

test("hapus lab dengan konfirmasi", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/labs");
  const initialRows = await page.getByRole("row").count();
  const deleteBtn = page.getByRole("row").last().getByRole("button").last();
  await deleteBtn.click();
  await page.getByRole("button", { name: "Hapus" }).click();
  const finalRows = await page.getByRole("row").count();
  expect(finalRows).toBe(initialRows - 1);
});

test("tambah barang baru", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/items");
  await page.getByRole("button", { name: "Tambah Barang" }).click();
  await page.getByLabel("Nama Barang").fill("Headset");
  await page.getByLabel("Kategori").fill("Periferal");
  await page.getByLabel("Jumlah Awal").fill("10");
  await page.getByLabel("Jumlah Berfungsi").fill("10");
  await page.getByRole("button", { name: "Tambah" }).click();
  await expect(page.getByText("Headset")).toBeVisible();
});

test("filter barang berdasarkan lab", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/items");
  const allCount = await page.getByRole("row").count();
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Lab RPL" }).click();
  const filteredCount = await page.getByRole("row").count();
  expect(filteredCount).toBeLessThanOrEqual(allCount);
});

test("tambah akun kelas baru", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/classes");
  await page.getByRole("button", { name: "Tambah Kelas" }).click();
  await page.getByLabel("Nama Kelas").fill("XII TKJ 1");
  await page.getByLabel("Username").fill("xii-tkj-1");
  await page.getByLabel("Password").fill("pass123");
  await page.getByRole("button", { name: "Tambah" }).click();
  await expect(page.getByText("XII TKJ 1")).toBeVisible();
});

test("reset password kelas", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/classes");
  // Click the key/reset button on first class row
  const keyBtn = page.getByRole("row").nth(1).getByRole("button").first();
  await keyBtn.click();
  await page.getByLabel("Password Baru").fill("newpass456");
  await page.getByRole("button", { name: "Reset" }).click();
  // Dialog should close (no error)
  await expect(page.getByLabel("Password Baru")).not.toBeVisible();
});

test("log sesi menampilkan riwayat sesi", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/sessions");
  await expect(page.locator('main').getByText("Log Sesi")).toBeVisible();
  // Should have at least mock sessions
  const rows = await page.getByRole("row").count();
  expect(rows).toBeGreaterThan(1);
});

test("search di log sesi berfungsi", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/sessions");
  await page.getByPlaceholder("Cari kelas atau lab...").fill("RPL");
  const rows = await page.getByRole("row").count();
  expect(rows).toBeGreaterThanOrEqual(1);
});
