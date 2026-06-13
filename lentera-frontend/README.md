# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


lentera-frontend/
├── public/
└── src/
    ├── assets/             # Gambar statis, logo Lentera, favicon
    ├── components/         # Global Shared Components (Reusable UI)
    │   ├── ui/             # Komponen kecil/atomik (Button, Input, Badge, Card)
    │   ├── Navbar.jsx      # Navbar atas dengan ikon profil login admin
    │   ├── Sidebar.jsx     # Sidebar khusus untuk Dashboard Admin
    │   └── ProtectedRoute.jsx # Guard untuk membatasi akses halaman admin
    │
    ├── context/            # Global State Management
    │   └── AuthContext.jsx # Menyimpan status login admin & token JWT
    │
    ├── features/           # Modularisasi berdasarkan Fitur Utama (Sangat disarankan)
    │   ├── complaints/     # Fitur Pengaduan Publik (Photo 3, 4, 5)
    │   │   ├── components/ 
    │   │   │   ├── ComplaintForm.jsx    # Form input keluhan nasabah
    │   │   │   └── ComplaintSuccess.jsx # Modal/Notifikasi setelah berhasil submit
    │   │   ├── hooks/
    │   │   │   └── useSubmitComplaint.js # Logika integrasi API ke backend keluhan
    │   │   └── services/
    │   │       └── complaintApi.js
    │   │
    │   ├── auth/           # Fitur Autentikasi Admin (Photo 6)
    │   │   ├── components/
    │   │   │   └── LoginForm.jsx
    │   │   └── hooks/
    │   │       └── useAuth.js
    │   │
    │   ├── analytics/      # Fitur Dashboard Utama Admin (Photo 7 & 8)
    │   │   ├── components/
    │   │   │   ├── MetricsCard.jsx      # Ringkasan total keluhan, high, med, low
    │   │   │   ├── UrgencyChart.jsx     # Visualisasi grafik/chart analisis urgensi
    │   │   │   └── ComplaintTable.jsx   # Tabel daftar keluhan masuk
    │   │   └── hooks/
    │   │       └── useAnalyticsData.js  # Mengambil data prediksi model dari backend
    │
    ├── hooks/              # Global custom hooks (misal: useDebounce, useTheme)
    ├── layouts/            # Layout Wrapper untuk halaman
    │   ├── MainLayout.jsx  # Layout publik (Navbar + content pengaduan)
    │   └── AdminLayout.jsx # Layout admin (Sidebar + Navbar + area dashboard)
    │
    ├── pages/              # Pemetaan file berdasarkan Rute URL (Entry Points)
    │   ├── ComplaintPage.jsx # Halaman Utama Pengaduan Publik (URL: /)
    │   ├── LoginPage.jsx     # Halaman Login Admin (URL: /login)
    │   └── DashboardPage.jsx # Halaman Dashboard Analytics Admin (URL: /admin/dashboard)
    │
    ├── services/           # Konfigurasi dasar API klien
    │   └── api.js          # Instance Axios / Fetch wrapper ke backend Lentera
    │
    ├── App.jsx             # Pengaturan Routing (React Router)
    ├── index.css           # File CSS utama (@import "tailwindcss";)
    └── main.jsx            # Entry point aplikasi dari Vite
