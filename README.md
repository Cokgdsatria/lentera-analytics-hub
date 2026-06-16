# Modul Prapemrosesan Teks - Proyek Lentera

Dokumentasi ini menjelaskan arsitektur prapemrosesan data (*preprocessing pipeline*) untuk Modul Intelligent Triage pada proyek Lentera. Modul ini dirancang untuk dapat digunakan ulang (*reusable*) dan mendukung eksperimen berbagai arsitektur model (Machine Learning Klasik, LSTM, dan Transformer/BERT).

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
    * **Peruntukan**: Model **Machine Learning Klasik** (TF-IDF) dan arsitektur sekuensial dasar (**LSTM**).
2.  **`Raw_Filtered_Narrative`**
    * **Karakteristik**: Mempertahankan tanda baca, angka, kapitalisasi, dan struktur kalimat utuh. Hanya dibersihkan dari tag privasi `xxxx`.
    * **Peruntukan**: Eksklusif untuk model **Transformer (BERT, RoBERTa)** guna mempertahankan konteks *Self-Attention*.

---

## 3. Panduan Eksekusi dan Kolaborasi di Google Colab

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

## 4. Instalasi Aplikasi Full Stack

Bagian sebelumnya tetap menjadi dokumentasi modul riset dan prapemrosesan ML. Bagian ini menambahkan panduan menjalankan aplikasi full stack Lentera Analytics Hub yang terdiri dari backend FastAPI, frontend React/Vite, dan modul inference ML.

### Struktur Aplikasi

```text
.
├── docker-compose.yml
├── lentera-backend/
├── lentera-frontend/
├── lentera-ml-research/
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
python3 tests/test_all_features.py
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

### Catatan ML Inference

Backend sudah memiliki kontrak inference yang stabil untuk kategori, sentimen, dan urgensi. Jika artefak model final belum tersedia, backend memakai provider rule-based deterministik dan menandai hasil dengan `provider=rules`.

Jika model final tersedia sebagai joblib pipeline, set environment variable berikut di backend:

```env
LENTERA_SKLEARN_PIPELINE_PATH=/path/to/model.joblib
```

Artefak model runtime tidak perlu di-commit ke repo publik. Simpan model lewat storage atau environment deployment masing-masing.

### Keamanan Repo Publik

Repo ini sengaja publik untuk penilaian proyek. Jangan commit:

* `.env`
* database runtime seperti `.db` atau `.sqlite`
* token, API key, atau private key
* `node_modules`
* `dist`
* artefak model besar seperti `.pkl`, `.joblib`, `.h5`, atau `.pt`

Gunakan file `.env.example` sebagai template konfigurasi.
