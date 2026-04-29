import { test, expect } from "@playwright/test";

async function loginKelas(page: import("@playwright/test").Page, namaKelas = "X RPL 1") {
  await page.context().clearCookies();
  await page.goto("/");
  await page.evaluate(() => sessionStorage.clear());
  // Wait for Supabase to load class list
  await expect(page.getByRole("combobox")).toBeEnabled({ timeout: 8000 });
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: namaKelas }).click();
  await page.getByPlaceholder("Masukkan password").fill("kelas123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/kelas/labs", { timeout: 15000 });
}

async function startSession(page: import("@playwright/test").Page, labText: string) {
  const labCard = page.locator(".hover\\:shadow-md, .opacity-60").filter({ hasText: labText });
  await labCard.getByRole("button").first().click();
  // Confirm dialog if it appears (fresh start) — no dialog means already on session page (Lanjutkan)
  if (await page.getByRole("dialog").isVisible()) {
    await page.getByRole("dialog").getByRole("button", { name: "Mulai Sesi" }).click();
  }
  await expect(page.locator("main").getByText("Sesi Aktif")).toBeVisible({ timeout: 10000 });
}

test("halaman labs menampilkan daftar lab", async ({ page }) => {
  await loginKelas(page);
  await expect(page.getByText("Pilih Laboratorium")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Lab Komputer 1")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Lab RPL")).toBeVisible();
  await expect(page.getByText("Lab Jaringan")).toBeVisible();
});

test("alur lengkap sesi: mulai → aktif → checkout → result aman", async ({ page }) => {
  await loginKelas(page); // "X RPL 1"
  await startSession(page, "Lab Komputer 1");

  await expect(page.locator("main").getByText("Lab Komputer 1")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("main").getByText("Inventaris Lab")).toBeVisible();

  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  await expect(page.getByText("Checklist Akhir Sesi")).toBeVisible({ timeout: 10000 });
  await expect(page.locator("main").getByText("Lab Komputer 1")).toBeVisible();

  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();

  await expect(page.getByText("Status Lab Aman")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Semua barang sesuai!")).toBeVisible();

  await page.getByRole("button", { name: "Selesai" }).click();
  await expect(page).toHaveURL("/kelas/labs", { timeout: 10000 });
});

test("alur sesi dengan selisih barang menghasilkan peringatan", async ({ page }) => {
  await loginKelas(page, "X RPL 2");
  await startSession(page, "Lab RPL");

  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  const firstCountInput = page.getByLabel("Jumlah Aktual").first();
  const currentVal = await firstCountInput.inputValue();
  await firstCountInput.fill(String(Number(currentVal) - 1));

  await expect(page.getByText(/Kurang \d+ unit/).first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Ada barang yang tidak sesuai")).toBeVisible();

  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();

  await expect(page.getByText("Ada Selisih / Kerusakan")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Terdapat ketidaksesuaian barang")).toBeVisible();
});

test("alur sesi dengan barang rusak menghasilkan peringatan", async ({ page }) => {
  await loginKelas(page, "XI RPL 1");
  await startSession(page, "Lab Komputer 1");

  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  const firstConditionSelect = page.getByLabel("Kondisi").first();
  await firstConditionSelect.click();
  await page.getByRole("option", { name: /Rusak/ }).click();

  await expect(page.getByText("Ada barang yang tidak sesuai")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();

  await expect(page.getByText("Ada Selisih / Kerusakan")).toBeVisible({ timeout: 10000 });
});

test("checkout menampilkan checklist barang dengan benar", async ({ page }) => {
  await loginKelas(page, "XII RPL 1");
  await startSession(page, "Lab Komputer 1");

  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  await expect(page.getByText("PC / Komputer")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Monitor")).toBeVisible();
  await expect(page.getByText("Keyboard")).toBeVisible();
  await expect(page.getByText("Mouse")).toBeVisible();

  // Cleanup: submit to close session
  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();
});

test("tombol kembali dari checkout ke halaman sesi aktif", async ({ page }) => {
  await loginKelas(page, "X RPL 2");
  await startSession(page, "Lab RPL");

  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  await expect(page.getByText("Checklist Akhir Sesi")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Kembali" }).click();
  await expect(page.locator("main").getByText("Sesi Aktif")).toBeVisible({ timeout: 10000 });

  // Cleanup: end the session so it doesn't pollute subsequent runs
  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();
  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();
});

test("logout kelas kembali ke login", async ({ page }) => {
  await loginKelas(page);
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL("/", { timeout: 8000 });
});
