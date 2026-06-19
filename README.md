# Modul Prapemrosesan Teks - Proyek Lentera

Dokumentasi ini menjelaskan arsitektur prapemrosesan data (*preprocessing pipeline*) untuk Modul Intelligent Triage pada proyek Lentera. Modul ini dirancang untuk dapat digunakan ulang (*reusable*) dan mendukung eksperimen berbagai arsitektur model (Machine Learning Klasik, LSTM, GRU, LSTM, dan Bi-LSTM).

---

## 1. Struktur Direktori Modul

Seluruh logika bisnis prapemrosesan dipisahkan dari Jupyter Notebook dan disimpan secara terpusat pada direktori `src/` dengan pembagian sebagai berikut:

* **`src/constants.py`**
    * Menyimpan seluruh konfigurasi dan variabel statis proyek.
    * Berisi daftar kata kunci pelabelan otomatis serta daftar pengecualian *stopwords* bahasa Inggris (`WORDS_TO_KEEP`).
* **`src/preprocessing.py`**
    * Menyimpan fungsi transformasi data secara modular dan tervektorisasi (*vectorized operations*).
    * Fungsi utama meliputi:
        * `filter_invalid_complaints`: Membersihkan baris kosong (NaN) dan mengeliminasi keluhan dengan panjang di bawah 3 kata.
        * `apply_urgency_labels`: Melakukan pelabelan otomatis (*auto-tagging*) tingkat urgensi secara paralel.
        * `normalize_text_pipeline`: Menjalankan lematisasi dan pembersihan teks menggunakan `spaCy`.

---

## 2. Varian Fitur Teks (*Dual-Pipeline Output*)

Untuk mengakomodasi karakteristik algoritma pemodelan yang berbeda, fungsi `normalize_text_pipeline` menghasilkan dua representasi teks secara simultan:

1.  **`Cleaned_Narrative`**
    * **Karakteristik**: Huruf kecil, tanpa apostrof, tanpa angka, tanpa tanda baca, terlematisasi, dan bebas *stopwords*.
    * **Peruntukan**: Model **Machine Learning Klasik** (TF-IDF) dan arsitektur sekuensial (**LSTM, GRU, CNN-BiLSTM**).
2.  **`Raw_Filtered_Narrative`**
    * **Karakteristik**: Mempertahankan tanda baca, angka, kapitalisasi, dan struktur kalimat utuh. Hanya dibersihkan dari tag privasi `xxxx`.
    * **Peruntukan**: Eksklusif untuk model **Transformer (BERT, RoBERTa)** guna mempertahankan konteks *Self-Attention*.
    * > [!NOTE]
      > **Disclaimer:** Fitur ini saat ini belum digunakan secara aktif oleh model yang ada di repositori (Baseline, LSTM, GRU, CNN-BiLSTM semuanya menggunakan `Cleaned_Narrative`). Fitur ini sengaja dibuat dan dipertahankan di dalam *pipeline* sebagai persiapan (*future-proofing*) untuk pengembangan model berbasis Transformer di masa mendatang.

---

## 3. Penanganan Data Tidak Seimbang (Imbalanced Data)

Dataset keluhan finansial umumnya sangat tidak seimbang (mayoritas keluhan masuk ke urgensi Low atau Medium). Untuk mencegah bias pada prediksi:
* Proyek ini menerapkan teknik **Undersampling** terstruktur secara eksklusif (tidak menggunakan *class weighting*).
* Jumlah data pada kelas mayoritas dipangkas secara acak agar jumlahnya sama persis dengan jumlah sampel pada kelas minoritas.
* Hal ini menjamin bahwa evaluasi performa seluruh model (Klasik maupun Deep Learning) berjalan valid dan *apple-to-apple*.

---

## 4. Panduan Eksekusi dan Kolaborasi di Google Colab

Karena Google Colab beroperasi pada lingkungan virtual, kita menggunakan integrasi Google Drive. Terdapat dua opsi sinkronisasi folder kerja `lentera-ml-research` untuk tim:

**Opsi A: Salinan Mandiri**
Setiap anggota mengunggah keseluruhan folder proyek secara mandiri ke dalam *root* Google Drive masing-masing (`My Drive/`).

**Opsi B: Folder Bersama (Shared Folder)**
Jika menggunakan tautan folder yang dibagikan (*Shared Folder*), anggota tim **wajib** melakukan klik kanan pada folder tersebut di menu *"Shared with me"*, lalu pilih **"Add shortcut to Drive"** dan letakkan di *My Drive*. Pastikan nama pintasan tetap `lentera-ml-research`.

**Skrip Inisialisasi Colab**
Gunakan blok kode berikut pada sel pertama di setiap Jupyter Notebook untuk mencegah galat `ModuleNotFoundError`:

```python
import sys
import os
from google.colab import drive

# 1. Menautkan Google Drive
drive.mount('/content/drive')

# 2. Tentukan jalur absolut (Berlaku untuk folder mandiri maupun pintasan)
PROJECT_ROOT = '/content/drive/MyDrive/lentera-ml-research'
os.chdir(PROJECT_ROOT)

# 3. Daftarkan direktori root ke dalam sistem pencarian Python
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# 4. Unduh model bahasa spaCy (Wajib dijalankan jika lingkungan virtual baru)
# !python -m spacy download en_core_web_sm

# 5. Impor modul
from src.preprocessing import filter_invalid_complaints, apply_urgency_labels, normalize_text_pipeline
```

---

## 5. Instalasi Aplikasi Full Stack

Bagian sebelumnya tetap menjadi dokumentasi modul riset dan prapemrosesan ML. Bagian ini menambahkan panduan menjalankan aplikasi full stack Lentera Analytics Hub yang terdiri dari backend FastAPI, frontend React/Vite, dan modul inference ML.

### Struktur Aplikasi

```text
.
├── docker-compose.yml
├── lentera-backend/
├── lentera-frontend/
└── lentera-ml-research/
    └── tests/
```

### Jalankan dengan Docker

Cara tercepat untuk menjalankan backend dan frontend secara bersamaan:

```bash
docker compose up --build -d
```

Setelah container berjalan:

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:8000`
* Dokumentasi API: `http://localhost:8000/docs`
* Health check: `http://localhost:8000/health`

Akun admin demo untuk pengujian lokal:

```text
Email: admin@resolv.com
Password: admin123
```

Hentikan container tanpa menghapus data:

```bash
docker compose down
```

Database lokal dibuat oleh Docker Compose melalui volume Docker. File database, `.env`, cache, hasil build, dan dependency lokal tidak perlu dipush ke GitHub.

### Testing Fitur

Folder `tests/` berisi smoke test Python untuk alur utama aplikasi, termasuk autentikasi, submit keluhan, analytics, export, dan inference urgensi.

Jalankan setelah backend aktif:

```bash
python3 lentera-ml-research/tests/test_all_features.py
```

### Instalasi Frontend Saja

Panduan lengkap tersedia di `lentera-frontend/README.md`.

Ringkasnya:

```bash
cd lentera-frontend
cp .env.example .env
npm install
npm run dev
```

Pastikan `VITE_API_BASE_URL` mengarah ke backend, misalnya:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Instalasi Backend Saja

Panduan lengkap tersedia di `lentera-backend/README.md`.

Ringkasnya:

```bash
cd lentera-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Deploy Terpisah

Frontend cocok dideploy ke Vercel dengan konfigurasi:

* Root directory: `lentera-frontend`
* Build command: `npm run build`
* Output directory: `dist`
* Environment variable: `VITE_API_BASE_URL=https://URL-BACKEND-RAILWAY/api/v1`

Backend cocok dideploy ke Railway dengan konfigurasi:

* Root directory: `lentera-backend`
* Dockerfile: `lentera-backend/Dockerfile`
* Port: `8000`
* Environment variables penting:
    * `LENTERA_DATABASE_URL`
    * `LENTERA_CORS_ORIGINS`
    * `LENTERA_JWT_SECRET_KEY`
    * `LENTERA_ADMIN_EMAIL`
    * `LENTERA_ADMIN_PASSWORD`

Untuk deployment publik, gunakan PostgreSQL Railway dan isi `LENTERA_CORS_ORIGINS` dengan domain frontend Vercel.

### Replikasi Deployment Production

Bagian ini merangkum langkah yang dipakai untuk menyiapkan deployment production saat ini.

#### 1. Siapkan artefak model

Artefak model disimpan di folder Google Drive berikut:

```text
https://drive.google.com/drive/folders/18iORnxAah_4J6B6z17lxC8gypjeFAC6x
```

File yang dibutuhkan backend:

```text
lentera-backend/model/cnn_bilstm_phase1.keras
lentera-backend/model/cnn_bilstm_phase1.pkl
lentera-backend/model/cnn_bilstm_tokenizer.pkl
lentera-backend/model/cnn_bilstm_label_encoder.pkl
```

Untuk deployment ini, file model ikut di-commit agar Docker image Railway dapat dibangun tanpa storage eksternal. `cnn_bilstm_tokenizer.pkl` adalah tokenizer yang dipakai runtime; `cnn_bilstm_phase1.pkl` tetap disimpan sebagai artefak riset/backup.

#### 2. Jalankan dan tes lokal dengan Docker

```bash
docker compose up --build -d
python3 lentera-ml-research/tests/test_all_features.py
```

Cek provider model:

```bash
curl -X POST http://localhost:8000/api/v1/inference/predict \
  -H "Content-Type: application/json" \
  -d '{"category":"Security / Privacy","description":"Possible data breach with unauthorized login activity."}'
```

Respons yang benar menampilkan:

```json
{"provider":"keras","version":"keras:cnn_bilstm_phase1.keras"}
```

#### 3. Commit dan push ke `main`

Pastikan lokal tidak tertinggal dari remote sebelum push:

```bash
git fetch origin main --prune
git status -sb
git pull --ff-only origin main
git add .
git commit -m "Deskripsi perubahan"
git push origin main
```

Jika file model ter-ignore di clone lain, tambahkan eksplisit:

```bash
git add -f lentera-backend/model/
```

#### 4. Deploy backend ke Railway

Backend dibangun dari `lentera-backend/Dockerfile`; Dockerfile menyalin `app/` dan `model/` ke image.

Set environment variables Railway:

```env
LENTERA_DATABASE_URL=sqlite:///./lentera.db
LENTERA_CORS_ORIGINS=https://lentera-frontend.vercel.app,http://localhost:5173,http://127.0.0.1:5173
LENTERA_JWT_SECRET_KEY=generate-a-strong-random-secret
LENTERA_ADMIN_EMAIL=admin@resolv.com
LENTERA_ADMIN_PASSWORD=admin123
LENTERA_UPLOAD_DIR=./storage/evidence
LENTERA_KERAS_MODEL_PATH=/app/model/cnn_bilstm_phase1.keras
LENTERA_KERAS_TOKENIZER_PATH=/app/model/cnn_bilstm_tokenizer.pkl
LENTERA_KERAS_LABEL_ENCODER_PATH=/app/model/cnn_bilstm_label_encoder.pkl
LENTERA_KERAS_MAX_LEN=200
LENTERA_KERAS_LABELS=High,Low,Medium
```

Deploy dengan Railway CLI:

```bash
railway login
railway link
railway up ./lentera-backend --path-as-root --service lentera-analytics-hub --environment production
railway domain --service lentera-analytics-hub --port 8000
```

Production backend saat dokumentasi ini ditulis:

```text
https://lentera-analytics-hub-production.up.railway.app
```

Verifikasi:

```bash
curl https://lentera-analytics-hub-production.up.railway.app/health
curl -X POST https://lentera-analytics-hub-production.up.railway.app/api/v1/inference/predict \
  -H "Content-Type: application/json" \
  -d '{"category":"Security / Privacy","description":"Possible data breach with unauthorized login activity."}'
```

#### 5. Deploy frontend ke Vercel

Frontend memakai Vite. File `lentera-frontend/vercel.json` diperlukan agar route SPA seperti `/login` dan `/admin/complaints/{id}` tidak 404 saat dibuka langsung.

Set environment variable Vercel:

```bash
vercel env add VITE_API_BASE_URL production \
  --cwd lentera-frontend \
  --value https://lentera-analytics-hub-production.up.railway.app/api/v1 \
  --yes --force
```

Deploy:

```bash
vercel deploy lentera-frontend --prod --yes
```

Production frontend saat dokumentasi ini ditulis:

```text
https://lentera-frontend.vercel.app
```

#### 6. Verifikasi production end-to-end

1. Buka `https://lentera-frontend.vercel.app`.
2. Submit complaint baru dari form publik.
3. Login admin di `https://lentera-frontend.vercel.app/login`.
4. Buka `All Complaints`.
5. Klik row complaint; row harus mengarah ke `https://lentera-frontend.vercel.app/admin/complaints/{id}`.
6. Di halaman detail, panel `ML Inference` harus menampilkan provider `keras (keras:cnn_bilstm_phase1.keras)`.

Skenario smoke test yang sudah diverifikasi di production:

```text
Security/privacy breach -> High, provider keras
Billing overcharged/refund -> Medium, provider keras
Customer service ringan -> Low, provider keras
```

### Catatan ML Inference

Backend sudah memiliki kontrak inference yang stabil untuk kategori, sentimen, dan urgensi. Jika artefak model final belum tersedia, backend memakai provider rule-based deterministik dan menandai hasil dengan `provider=rules`.

Jika model final tersedia sebagai joblib pipeline, set environment variable berikut di backend:

```env
LENTERA_SKLEARN_PIPELINE_PATH=/path/to/model.joblib
```

Pada deployment ini, artefak CNN-BiLSTM di `lentera-backend/model/` ikut di-commit agar Railway dapat membangun Docker image lengkap. Untuk deployment publik yang lebih besar atau berisi model privat, simpan model lewat object storage atau artifact registry.

### Keamanan Repo Publik

Repo ini sengaja publik untuk penilaian proyek. Jangan commit:

* `.env`
* database runtime seperti `.db` atau `.sqlite`
* token, API key, atau private key
* `node_modules`
* `dist`
* artefak model privat, kecuali artefak yang memang sengaja dipublikasikan untuk replikasi proyek ini

Gunakan file `.env.example` sebagai template konfigurasi.
