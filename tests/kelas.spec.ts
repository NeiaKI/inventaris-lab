import { test, expect } from "@playwright/test";

async function loginKelas(page: import("@playwright/test").Page, namaKelas = "X RPL 1") {
  await page.goto("/");
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: namaKelas }).click();
  await page.getByPlaceholder("Masukkan password").fill("kelas123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/kelas/labs");
}

test("halaman labs menampilkan daftar lab", async ({ page }) => {
  await loginKelas(page);
  await expect(page.getByText("Pilih Laboratorium")).toBeVisible();
  await expect(page.getByText("Lab Komputer 1")).toBeVisible();
  await expect(page.getByText("Lab RPL")).toBeVisible();
  await expect(page.getByText("Lab Jaringan")).toBeVisible();
});

test("alur lengkap sesi: mulai → aktif → checkout → result aman", async ({ page }) => {
  await loginKelas(page);

  // Mulai sesi di Lab Komputer 1
  const labCard = page.locator(".hover\\:shadow-md").filter({ hasText: "Lab Komputer 1" });
  await labCard.getByRole("button", { name: "Mulai Sesi" }).click();

  // Konfirmasi dialog
  await expect(page.getByText("Mulai Sesi?")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Mulai Sesi" }).click();

  // Halaman sesi aktif
  await expect(page.locator('main').getByText("Sesi Aktif")).toBeVisible();
  await expect(page.locator('main').getByText("Lab Komputer 1")).toBeVisible();
  await expect(page.locator('main').getByText("Inventaris Lab")).toBeVisible();

  // Klik akhiri sesi
  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  // Halaman checkout — semua barang kondisi baik, tidak ada perubahan
  await expect(page.getByText("Checklist Akhir Sesi")).toBeVisible();
  await expect(page.locator('main').getByText("Lab Komputer 1")).toBeVisible();

  // Submit tanpa perubahan (semua aman)
  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();

  // Halaman result — status aman
  await expect(page.getByText("Status Lab Aman")).toBeVisible();
  await expect(page.getByText("Semua barang sesuai!")).toBeVisible();

  // Tombol selesai kembali ke labs
  await page.getByRole("button", { name: "Selesai" }).click();
  await expect(page).toHaveURL("/kelas/labs");
});

test("alur sesi dengan selisih barang menghasilkan peringatan", async ({ page }) => {
  await loginKelas(page, "X RPL 2");

  // Mulai sesi di Lab RPL
  const labCard = page.locator(".hover\\:shadow-md, .opacity-60").filter({ hasText: "Lab RPL" });
  await labCard.getByRole("button").click();
  await page.getByRole("dialog").getByRole("button", { name: "Mulai Sesi" }).click();
  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  // Kurangi jumlah barang pertama
  const firstCountInput = page.getByLabel("Jumlah Aktual").first();
  const currentVal = await firstCountInput.inputValue();
  await firstCountInput.fill(String(Number(currentVal) - 1));

  // Harus muncul warning
  await expect(page.getByText(/Kurang \d+ unit/).first()).toBeVisible();
  await expect(page.getByText("Ada barang yang tidak sesuai")).toBeVisible();

  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();

  // Result — ada selisih
  await expect(page.getByText("Ada Selisih / Kerusakan")).toBeVisible();
  await expect(page.getByText("Terdapat ketidaksesuaian barang")).toBeVisible();
});

test("alur sesi dengan barang rusak menghasilkan peringatan", async ({ page }) => {
  await loginKelas(page, "XI RPL 1");

  const labCard = page.locator(".hover\\:shadow-md").filter({ hasText: "Lab Komputer 1" });
  await labCard.getByRole("button", { name: "Mulai Sesi" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Mulai Sesi" }).click();
  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  // Ubah kondisi barang pertama menjadi rusak
  const firstConditionSelect = page.getByLabel("Kondisi").first();
  await firstConditionSelect.click();
  await page.getByRole("option", { name: /Rusak/ }).click();

  await expect(page.getByText("Ada barang yang tidak sesuai")).toBeVisible();
  await page.getByRole("button", { name: "Submit & Tutup Sesi" }).click();

  await expect(page.getByText("Ada Selisih / Kerusakan")).toBeVisible();
});

test("checkout menampilkan checklist barang dengan benar", async ({ page }) => {
  await loginKelas(page);

  const labCard = page.locator(".hover\\:shadow-md").filter({ hasText: "Lab Komputer 1" });
  await labCard.getByRole("button", { name: "Mulai Sesi" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Mulai Sesi" }).click();
  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  // Pastikan semua barang Lab Komputer 1 muncul
  await expect(page.getByText("PC / Komputer")).toBeVisible();
  await expect(page.getByText("Monitor")).toBeVisible();
  await expect(page.getByText("Keyboard")).toBeVisible();
  await expect(page.getByText("Mouse")).toBeVisible();
});

test("tombol kembali dari checkout ke halaman sesi aktif", async ({ page }) => {
  await loginKelas(page);

  const labCard = page.locator(".hover\\:shadow-md").filter({ hasText: "Lab Komputer 1" });
  await labCard.getByRole("button", { name: "Mulai Sesi" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Mulai Sesi" }).click();
  await page.getByRole("button", { name: "Akhiri Sesi & Cek Barang" }).click();

  await expect(page.getByText("Checklist Akhir Sesi")).toBeVisible();
  await page.getByRole("button", { name: "Kembali" }).click();
  await expect(page.getByText("Sesi Aktif")).toBeVisible();
});

test("logout kelas kembali ke login", async ({ page }) => {
  await loginKelas(page);
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL("/");
});
