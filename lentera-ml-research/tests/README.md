# Pengujian Integrasi Lentera (Integration Tests)

Pengujian ini memeriksa fungsionalitas backend yang sedang berjalan melalui protokol HTTP. Skrip ini sengaja hanya menggunakan *standard library* bawaan Python (*stdlib-only*) sehingga dapat dijalankan tanpa perlu menginstal dependensi tambahan di *host*.

Jalankan aplikasi terlebih dahulu:

```bash
docker compose up --build -d
```

Jalankan pengujian (dieksekusi dari *root* direktori proyek):

```bash
python3 lentera-ml-research/tests/test_all_features.py
```

Variabel lingkungan opsional:

```bash
LENTERA_TEST_BASE_URL=http://localhost:8000
LENTERA_TEST_ADMIN_EMAIL=admin@resolv.com
LENTERA_TEST_ADMIN_PASSWORD=admin123
```

Skrip ini akan mensimulasikan pembuatan beberapa sampel keluhan yang mencakup:

- Security / Privacy -> Tingkat urgensi High
- System Glitch -> Tingkat urgensi Medium
- Customer Service -> Tingkat urgensi Low
- Infrastructure Issue -> Tingkat urgensi Low
- Prediksi Billing Dispute dari kategori masukan `Other` -> Tingkat urgensi Medium