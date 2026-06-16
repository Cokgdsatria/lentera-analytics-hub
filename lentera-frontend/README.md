# Lentera Frontend

Frontend Lentera Analytics Hub dibangun dengan React, Vite, React Router, Tailwind CSS, dan Recharts. Aplikasi ini menyediakan form pengaduan publik, login admin, dashboard monitoring, analytics, tabel pengaduan, dan halaman detail pengaduan.

## Prasyarat

- Node.js 24 atau versi LTS modern yang kompatibel
- npm
- Backend Lentera berjalan dan dapat diakses

## Konfigurasi Environment

Salin template environment:

```bash
cp .env.example .env
```

Isi URL backend:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Untuk deploy Vercel, nilai ini harus mengarah ke backend publik:

```env
VITE_API_BASE_URL=https://URL-BACKEND-RAILWAY/api/v1
```

## Instalasi Lokal

```bash
npm install
npm run dev
```

Aplikasi lokal berjalan di:

```text
http://localhost:5173
```

## Build Production

```bash
npm run build
npm run preview
```

## Docker

Build dan jalankan hanya frontend:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8000/api/v1 \
  -t lentera-frontend:local .

docker run --rm -p 5173:80 lentera-frontend:local
```

Untuk menjalankan frontend + backend sekaligus, gunakan `docker compose up --build -d` dari root repo.

## Deploy ke Vercel

Pengaturan project:

```text
Framework Preset: Vite
Root Directory: lentera-frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Environment variable di Vercel:

```env
VITE_API_BASE_URL=https://URL-BACKEND-RAILWAY/api/v1
```

Setelah deploy, pastikan backend mengizinkan domain Vercel lewat `LENTERA_CORS_ORIGINS`.

## Endpoint Backend yang Dipakai

Frontend memakai endpoint berikut:

```text
POST  /api/v1/auth/login
POST  /api/v1/complaints
GET   /api/v1/complaints
GET   /api/v1/complaints/{id}
PATCH /api/v1/complaints/{id}
GET   /api/v1/complaints/export.csv
GET   /api/v1/analytics/summary
POST  /api/v1/inference/predict
```

## Catatan Repo Publik

Jangan commit file `.env`, `node_modules`, atau `dist`. Gunakan `.env.example` sebagai dokumentasi konfigurasi.
